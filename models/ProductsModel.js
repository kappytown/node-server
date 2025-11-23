const BaseModel     = require('./BaseModel');
const bcrypt        = require('bcrypt');

const { 
    ValidationException
} = require('../exceptions/CustomExceptions');

/**
 * Products Model
 * 
 * Handles all database operations for product resources.
 */
class ProductsModel extends BaseModel {
    /**
	 * Get all products
	 * 
	 * @param {int} offset 
	 * @param {int} limit 
	 * @returns {array}
	 */
    async readAll(offset, limit) {
        return await this.db.query(`SELECT * FROM products LIMIT ${offset}, ${limit}`, []);
    }

    /**
     * Get product by id 
	 * 
     * @param {int} id 
     * @returns {object}
     */
    async read(id) {
        return await this.db.fetchFirst('SELECT * FROM products WHERE id = ?', [ id ]);
    }

	/**
	 * Get all product categories
	 * 
	 * @returns {object}
	 */
    async readCategories() {
		return await this.db.query('SELECT id, category FROM products GROUP BY category ORDER BY category', []);
	}

	/**
	 * Gets the products by category name 
	 * 
	 * @param {string} name 
	 * @returns {array}
	 */
	async readCategory(name) {
		return await this.db.query('SELECT * FROM products WHERE LOWER(category) = ?', [ name.toLowerCase() ]);
	}

	/**
	 * Updates the product by id
	 * 
	 * @param {int} id 
	 * @param {object} product
	 * @returns {bool}
	 */
	async update(id, product) {
		let sql 	= '';
		let values 	= [];

		// Loop over product keys to create update statement
		for (const key in product) {
			const value = product[key];
			if (value !== null) {
				sql += `${sql === '' ? '' : ', '}${key} = ?`;

				// Store the values for the replacements
				values.push(product[key]);
			}
		}

		if (sql !== '') {
			sql = `UPDATE products SET ${sql} WHERE id = ?`;
			const result = await this.db.execute(sql, [ ...values, id ]);

			return result?.changedRows > 0;
		}
		return false;
	}

	/**
	 * Deletes the product by id
	 * @param {int} id 
	 * @returns {bool}
	 */
	async delete(id) {
		const result = await this.db.execute('DELETE FROM products WHERE id = ?', [ id ]);

		return result?.affectedRows > 0;
	}
}

module.exports = ProductsModel;