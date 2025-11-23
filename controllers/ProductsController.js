const AuthController  = require('./AuthController');
const ProductsModel     = require('../models/ProductsModel');
const { 
    ValidationException, 
    NotFoundException, 
    MissingParametersException 
} = require('../exceptions/CustomExceptions');

/**
 * Products Controller
 * 
 * Handles CRUD operations for product resources.
 */
class ProductsController extends AuthController {

    constructor(db, req, res) {
        super(db, req, res);

        this.model = new ProductsModel(this.db);
    }

    /**
     * List all products
     */
    async readAll() {
        const offset 	= parseInt(this.request.input('offset', 0, 'query'));
		const limit 	= parseInt(this.request.input('limit', 10, 'query'));
		const result 	= await this.model.readAll(offset, limit);

		await this.db.close();
		this.response.success(result);
    }

    /**
     * Gets the product by id
	 * 
	 * @throws {MissingParametersException}
     */
    async read() {
        const id = parseInt(this.request.getParam('id'));

		if (!id) {
			throw new MissingParametersException('Product id is required.');
		}

		const result = await this.model.read(id);

		await this.db.close();
		this.response.success(result);
    }

	/**
	 * Gets all the product categories
	 */
	async readCategories() {
		const result = await this.model.readCategories();

		await this.db.close();
		this.response.success(result);
	}

	/**
	 * Gets the products by category name
	 * 
	 * @throws {MissingParametersException}
	 */
    async readCategory() {
        const name = this.request.getParam('name');

		if (!name) {
			throw new MissingParametersException('Product category name is required.');
		}

		const result = await this.model.readCategory(name);

		await this.db.close();
		this.response.success(result);
    }

	/**
	 * Updates the product by id
	 * 
	 * @throws {MissingParametersException}
	 * @throws {ValidationException}
	 */
    async update() {
		await this.authenticate();

		const id 		= parseInt(this.request.getParam('id'));
		const product = {
			name: 		this.request.getSanitizedInput('name', null),
			desc: 		this.request.getSanitizedInput('description', null),
			price: 		this.request.getSanitizedInput('price', null, 'float'),
			stock: 		this.request.getSanitizedInput('stock', null, 'int'),
			category: 	this.request.getSanitizedInput('category', null),
			image_url: 	this.request.getSanitizedInput('image_url', null),
			is_active: 	this.request.getSanitizedInput('is_active', null, 'boolean')
		}

		if (!id) {
			throw new MissingParametersException('Product id is required.');
		}

		const result = await this.model.update(id, product);

		await this.db.close();

		if (!result) {
			throw new ValidationException('Failed to update product.');
		}

		this.response.success(result);
	}

	/**
	 * Deletes the product by id
	 * 
	 * @throws {MissingParametersException}
	 * @throws {ValidationException}
	 */
    async delete() {
		await this.authenticate();

		const id = parseInt(this.request.getParam('id'));

		if (!id) {
			throw new MissingParametersException('Product id is required.');
		}

		const result = await this.model.delete(id);

		await this.db.close();

		if (!result) {
			throw new ValidationException('Failed to delete product.');
		}

		this.response.success(result);
	}
}

module.exports = ProductsController;