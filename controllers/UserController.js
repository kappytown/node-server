const AuthController  = require('./AuthController');
const UserModel       = require('../models/UserModel');
const { 
    ValidationException, 
    NotFoundException, 
    MissingParametersException
} = require('../exceptions/CustomExceptions');

/**
 * UserController class handles all user related actions.
 * 
 * Note: All controllers that require authentication must extend the AuthController 
 * and call await this.authenticate() before executing any other code. This will ensure that no 
 * other code will execute if the user's session is invalid.
 */
class UserController extends AuthController {

    constructor(db, req, res) {
        super(db, req, res);

        this.model = new UserModel(this.db);
    }

    /**
     * Handels getting the user's session as well as deleting it
     */
    async session() {
        let result;
		if (this.request.method === 'GET') {
            // Authenticates the user's session
            await this.authenticate();

            // Gets the user's details
			result = await this.model.read(this.userId);

		} else {
            // Deletes the user' session
			result = await this.deleteSession();
        }

        // Cleanup
        await this.db.close();

		this.response.success(result);
    }

    /**
     * Logs the user in and creates the 
     * 
     * @throws {MissingParametersException}
     * @throws {NotFoundException}
     */
    async login() {
        const email     = this.request.getSanitizedInput('email', null, 'email');
        const password  = this.request.getSanitizedInput('password', null, 'password');
        
        if (!email || !password) {
            throw new MissingParametersException('Email and password are required');
        }

        const result = await this.model.login(email, password);

        if (!result) {
            this.deleteCookie();
            throw new NotFoundException('Invalid email or password');
        }

        await this.createSession(result.id);
        await this.db.close();

        const { password: _, ...userWithoutPassword } = result;
        this.response.success(userWithoutPassword);
    }

    /**
     * Logs the user and and removes the user's session
     */
    async logout() {
        await this.deleteSession();
        await this.db.close();
        
        this.response.success(null, 'Logged out successfully');
    }

    /**
     * Create a new customer
     * 
     * @throws {MissingParametersException}
     * @throws {ValidationException}
     */
    async create() {
        const name      = this.request.getSanitizedInput('name');
        const email     = this.request.getSanitizedInput('email', null, 'email');
        const password  = this.request.getSanitizedInput('password', null, 'password');

        if (!name || !email || !password) {
            throw new MissingParametersException('Name, email, and password are required.');
        }

        const result  = await this.model.create(name, email, password);

        await this.db.close();

        if (!result) {
            throw new ValidationException('Failed to create user. Email may already be in use.');
        }

        this.response.success(result);
    }

    /**
     * Gets the logged in user's info
     * 
     * @throws {MissingParametersException}
     */
    async read() {
        await this.authenticate();

        if (!this.userId) {
            throw new MissingParametersException('User id is required.');
        }
        
        const result = await this.model.read(this.userId);

        await this.db.close();
        this.response.success(result);
    }

    /**
     * Updates the logged in user's account
     * 
     * @throws {MissingParametersException}
     * @throws {ValidationException}
     */
    async update() {
        await this.authenticate();

        const name          = this.request.getSanitizedInput('name');
        const email         = this.request.getSanitizedInput('email', null, 'email');
        const password      = this.request.getSanitizedInput('password', null, 'password');
        const newPassword   = this.request.getSanitizedInput('new_password', null, 'password');

        if (!this.userId || !name || !email) {
            throw new MissingParametersException('User ID, name, and email are required.');
        }

        if (password || newPassword) {
            if (!password || !newPassword) {
                throw new ValidationException('Password is not valid.');
            }

            if (password === newPassword) {
                throw new ValidationException('Your current password and new password cannot be the same.');
            }
        }
        
        const result  = await this.model.update(this.userId, name, email, password, newPassword);

        await this.db.close();

        if (!result) {
            throw new ValidationException('Failed to update user. Please try again shortly.');
        }

        this.response.success(result);
    }

    /**
     * Deletes the logged in user's account
     * 
     * @throws {MissingParametersException}
     * @throws {ValidationException}
     */
    async delete() {
        await this.authenticate();

        if (!this.userId) {
            throw new MissingParametersException('User ID is required.');
        }

        const result = await this.model.delete(this.userId);

        await this.db.close();

        if (!result) {
            throw new ValidationException('Failed to delete user.')
        }

        this.response.clearCookie(this.cookieName);
        this.response.success(result);
    }

    /**
     * Create a new customer
     * 
     * @throws {MissingParametersException}
     * @throws {ValidationException}
     */
    async sendMail() {
        const name      = this.request.getSanitizedInput('name');
        const email     = this.request.getSanitizedInput('email', null, 'email');
        const message  = this.request.getSanitizedInput('message');

        if (!name || !email || !message) {
            throw new MissingParametersException('Name, email, and message are required.');
        }

        const result  = await this.model.sendMail(name, email, message);

        await this.db.close();

        if (!result) {
            throw new ValidationException('Failed to send email. Please try again shortly.');
        }

        this.response.success(result);
    }

    /**
     * Validates that password
     * 
     * @param {string} password 
     * @returns {boolean}
     * @protected
     */
    _isValidPassword(password) {
        return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#-_~$%^&*()])(?=\S*$).{8,20}$/.test(password);
    }
}

module.exports = UserController;