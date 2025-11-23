const BaseModel     = require('./BaseModel');
const bcrypt        = require('bcrypt');
const nodemailer    = require('nodemailer');

const { 
    ValidationException
} = require('../exceptions/CustomExceptions');

/**
 * User Model
 * 
 * Handles all database operations for customer resources.
 * Manages customer contact information and company associations.
 */
class UserModel extends BaseModel {
    /**
     * 
     * @param {string} email 
     * @param {string} password 
     * @returns {object|null}
     */
    async login(email, password) {
        const result = await this.db.query('SELECT * FROM users WHERE email = ?', [ email ]);
        
        if (result?.length > 0) {
            // Verify password
            const validPassword = await bcrypt.compare(password, result[0].password);
            if (!validPassword) {
                return null;
            }

            return result[0];
        }

        return null;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} email 
     * @param {string} password
     * @returns {object|null}
     */
    async create(name, email, password) {
        // Check if user already exists
        let result = await this._getUserByField('email', email);
        
        if (result?.length > 0) {
            throw new ValidationException('User already exists');
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        result = await this.db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [ name, email, hashedPassword ]);

        if (result?.insertId > 0) {
            return { id: result.insertId, email, name };
        } else {
            return null;
        }
    }

    /**
     * 
     * @param {int} id 
     * @returns {object}
     */
    async read(id) {
        const result = await this._getUserByField('id', id);

        if (result?.length > 0) {
            const { id, name, email } = result[0];
            return { id, name, email };
        }

        return {};
    }

    /**
     * 
     * @param {int} id 
     * @param {string} name 
     * @param {string} email 
     * @param {string} password
     * @param {string} newPassword
     * @returns {object|null}
     * @throws {ValidationException}
     */
    async update(id, name, email, password, newPassword) {
        //Password!1
        let result;
        // If updating password...
        if (password && newPassword) {
            result = await this._getUserByField('id', id);

            if (result?.length > 0) {
                // Verify password
                const validPassword = await bcrypt.compare(password, result[0].password);
                if (!validPassword) {
                    throw new ValidationException('Your current password is invalid');
                }
            }

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            result = await this.db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, id]);
        } else {
            result = await this.db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        }

        if (result?.changedRows > 0) {
            return { id, email, name };
        } else {
            return null;
        }
    }

    /**
     * 
     * @param {int} id 
     * @returns {bool}
     */
    async delete(id) {
        const result = await this.db.query('DELETE FROM users WHERE id = ?', [id]);
        
        return result?.affectedRows > 0;
    }

    /**
     * Send email
     * 
     * @param {string} name 
     * @param {string} email 
     * @param {string} message 
     * @returns {bool}
     */
    async sendMail(name, email, message) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'YOUR_GMAIL_ADDRESS',
                pass: 'YOUR_GMAIL_PASSWORD'
            }
        });

        return await transporter.sendMail({
            from: email,
            to: 'you@email.com',
            subject: 'Contact Us Form Inquiry',
            text: `From: ${name}\r\nEmail: ${email}\r\n${message}`,
            html: `<p>From: ${name}<br />Email: ${email}</p><p>$message</p>`
        });
    }

    /**
     * Get user by specific field
     * 
     * @param {string} field 
     * @param {string} value 
     * @returns {array}
     * @protected
     */
    async _getUserByField(field, value) {
        // Whitelist allowed fields to prevent SQL injection
        const allowedFields = [ 'id', 'email', 'name' ];
        if (!allowedFields.includes(field)) {
            throw new ValidationException('Invalid field name');
        }

        return await this.db.query(`SELECT * FROM users WHERE ${field} = ? LIMIT 1`, [value]); 
    }
}

module.exports = UserModel;