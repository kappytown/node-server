const BaseModel     = require('./BaseModel');
const bcrypt        = require('bcrypt');

const { 
    ValidationException
} = require('../exceptions/CustomExceptions');

/**
 * Orders Model
 * 
 * Handles all database operations for order resources.
 */
class OrdersModel extends BaseModel {
    /**
	 * Get all orders
	 * 
	 * @param {int} offset 
	 * @param {int} limit 
	 * @returns {array}
	 */
    async readAll(offset, limit) {
        return await this.db.query(`SELECT * FROM orders LIMIT ${offset}, ${limit}`, []);
    }

    /**
     * Gets the order by id 
	 * 
     * @param {int} id 
     * @returns {array}
     */
    async read(id) {
        return await this.db.query('SELECT o.id as order_id, u.name as customer, o.total, o.status, p.name as product, oi.quantity, oi.price FROM orders o JOIN users u ON o.user_id = u.id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE o.id = ?', [ id ]);
    }

	/**
	 * Get all order statuses
	 * 
	 * @returns {object}
	 */
    async readStatuses() {
		return await this.db.query('SELECT id, status FROM orders GROUP BY status ORDER BY status', []);
	}

	/**
	 * Gets the orders by status name 
	 * 
	 * @param {string} name 
	 * @returns {array}
	 */
	async readStatus(name) {
		return await this.db.query('SELECT * FROM orders WHERE LOWER(status) = ?', [ name.toLowerCase() ]);
	}
}

module.exports = OrdersModel;