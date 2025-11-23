const AuthController  = require('./AuthController');
const OrdersModel     = require('../models/OrdersModel');
const { 
    ValidationException, 
    NotFoundException, 
    MissingParametersException 
} = require('../exceptions/CustomExceptions');

/**
 * Orders Controller
 * 
 * Handles CRUD operations for order resources.
 */
class OrdersController extends AuthController {

    constructor(db, req, res) {
        super(db, req, res);

        this.model = new OrdersModel(this.db);
    }

    /**
     * List all orders
     */
    async readAll() {
		await this.authenticate();

        const offset 	= parseInt(this.request.input('offset', 0, 'query'));
		const limit 	= parseInt(this.request.input('limit', 10, 'query'));
		const result 	= await this.model.readAll(offset, limit);

		await this.db.close();
		this.response.success(result);
    }

    /**
     * Gets the order by id
	 * 
	 * @throws {MissingParametersException}
     */
    async read() {
		await this.authenticate();

        const id = parseInt(this.request.getParam('id'));

		if (!id) {
			throw new MissingParametersException('Order id is required.');
		}

		const result = await this.model.read(id);

		await this.db.close();
		this.response.success(result);
    }

	/**
	 * Gets all the order statuses
	 */
	async readStatuses() {
		const result = await this.model.readStatuses();

		await this.db.close();
		this.response.success(result);
	}

	/**
	 * Gets the orders by status name
	 * 
	 * @throws {MissingParametersException}
	 */
    async readStatus() {
        const name = this.request.getParam('name');

		if (!name) {
			throw new MissingParametersException('Order status name is required.');
		}

		const result = await this.model.readStatus(name);

		await this.db.close();
		this.response.success(result);
    }
}

module.exports = OrdersController;