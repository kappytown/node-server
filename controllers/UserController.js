const BaseController    = require('./BaseController');
const UserModel         = require('#models/UserModel');
const AuthModel 	    = require('#models/AuthModel');
const SessionService    = require('#services/SessionService');
const { 
	ValidationException, 
	NotFoundException, 
	MissingParametersException, 
	AuthenticationException
} = require('#exceptions/CustomExceptions');

/**
 * UserController class handles all user related actions.
 * 
 * Handles CRUD operations for user resources.
 */
class UserController extends BaseController {

    constructor(req, res) {
        super(req, res);

        this.model = new UserModel(this.db, this.request.userId);
        this.authModel = new AuthModel(this.db);
    }

    /**
     * Handels getting the user's session as well as deleting it
     */
    async session() {
        let result;
		if (this.request.method === 'GET') {
            // Gets the user's details
			result = await this.model.read();

		} else {
            // Deletes the user' session
			result = await this._handleLogout();
        }

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
            this.response.clearCookie(SessionService.getCookieName());
            throw new NotFoundException('Invalid email or password');
        }

        // Use SessionService to generate data
		const token 	= SessionService.generateToken();
		const expiresAt = SessionService.getExpiration();

        // Save to the db
		const sessionCreated = await this.authModel.createSession(result.id, token, expiresAt);

        if (!sessionCreated) {
			throw new AuthenticationException('Unable to create user session.');
		}

        // Set the session cookie
        this.response.cookie(SessionService.getCookieName(), token, { maxAge: SessionService.getCookieMaxAge(), secure: true, sameSite: 'Lax' }); // 2 weeks

        const { password: _, ...userWithoutPassword } = result;
        this.response.success(userWithoutPassword);
    }

    /**
     * Logs the user and and removes the user's session
     */
    async logout() {
        await this._handleLogout();
        
        this.response.success(null, 'Logged out successfully');
    }

	/**
	 * Deletes the users session
	 * 
	 * @returns {boolean} true if token was successfully deleted
	 */
	async _handleLogout() {
		const token = this.request.getCookie(SessionService.getCookieName());
		if (token) {
			await this.authModel.deleteSession(token);
		}

		// Delete the session token
		this.response.cookie(SessionService.getCookieName(), '', { expires: 'Thu, 01 Jan 1970 00:00:00 GMT' });

		return true;
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
        const result = await this.model.read(this.userId);

        this.response.success(result);
    }

    /**
     * Updates the logged in user's account
     * 
     * @throws {MissingParametersException}
     * @throws {ValidationException}
     */
    async update() {
        const name          = this.request.getSanitizedInput('name');
        const email         = this.request.getSanitizedInput('email', null, 'email');
        const password      = this.request.getSanitizedInput('password', null, 'password');
        const newPassword   = this.request.getSanitizedInput('new_password', null, 'password');

        if (!this.request.userId || !name || !email) {
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
        
        const result  = await this.model.update(name, email, password, newPassword);

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
        const result = await this.model.delete();

        if (!result) {
            throw new ValidationException('Failed to delete user.')
        }

        this.response.clearCookie(SessionService.getCookieName());
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