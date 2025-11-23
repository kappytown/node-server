const BaseModel = require('./BaseModel');

/**
 * Report Model
 * 
 * Handles all database operations for report resources.
 * Reports store structured data in JSON format for analytics and business intelligence.
 */
class ReportModel extends BaseModel {
    /**
     * 
     * @param {int} id
     * @returns {array}
     */
    async orderStats(id) {
        return await this.db.query('SELECT COUNT(id) AS totalOrders, IFNULL(SUM(total), 0) AS totalSpent, IFNULL(AVG(total), 0) AS averageOrder, IFNULL(SUM((SELECT COUNT(id) FROM order_items WHERE order_id = o.id)), 0) AS numItems FROM orders o WHERE user_id = ?', [ id ]);
    }

    /**
     * 
     * @param {int} id
     * @returns {array}
     */
    async topProducts(id) {
        return  await this.db.query('SELECT p.name, max(oi.quantity) AS quantity, oi.price FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id WHERE o.user_id = ? GROUP BY p.name ORDER BY oi.quantity DESC LIMIT 5', [ id ]);
    }

    /**
     * 
     * @param {int} id
     * @returns {array}
     */
    async recentOrders(id) {
        return await this.db.query('SELECT o.id, DATE_FORMAT(o.created_at, "%b %D, %Y") AS date, COUNT(oi.quantity) as numItems, o.total, o.status FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id WHERE user_id = ? GROUP BY order_id LIMIT 5', [ id ]);
    }
}

module.exports = ReportModel;