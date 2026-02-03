const BaseController  = require('./BaseController');
const OrdersModel     = require('#models/OrdersModel');
const { MissingParametersException } = require('#exceptions/CustomExceptions');

/**
 * Orders Controller
 * 
 * Handles CRUD operations for order resources.
 */
class OrdersController extends BaseController {

    constructor(req, res) {
        super(req, res);

        this.model = new OrdersModel(this.db, this.request.userId);
    }

    /**
     * List all orders
     */
    async readAll() {
		const offset 	= parseInt(this.request.input('offset', 0, 'query'));
		const limit 	= parseInt(this.request.input('limit', 10, 'query'));
		const result 	= await this.model.readAll(offset, limit);

		this.response.success(result);
    }

    /**
     * Gets the order by id
	 * 
	 * @throws {MissingParametersException}
     */
    async read() {
		const id = parseInt(this.request.getParam('id'));

		if (!id) {
			throw new MissingParametersException('Order id is required.');
		}

		const result = await this.model.read(id);

		this.response.success(result);
    }

	/**
	 * Gets all the order statuses
	 */
	async readStatuses() {
		const result = await this.model.readStatuses();

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

		this.response.success(result);
    }
}

module.exports = OrdersController;