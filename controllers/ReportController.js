const BaseController  = require('./BaseController');
const ReportModel     = require('../models/ReportModel');
const { 
    ValidationException, 
    NotFoundException, 
    MissingParametersException 
} = require('../exceptions/CustomExceptions');

/**
 * Report Controller
 * 
 * Handles CRUD operations for report resources.
 * Reports can store structured data in JSON format for analytics and reporting.
 */
class ReportController extends BaseController {

    constructor(req, res) {
        super(req, res);

        this.model = new ReportModel(this.db, this.request.userId);
    }

    /**
     * This will route the request based off of the report id
     * 
     * @throws {NotFoundException}
     */
    async index() {
        const reportId = this.request.getParam('reportId');
        
        if (typeof this[reportId] === 'function') {
            await this[reportId]();
        } else {
            throw new NotFoundException('Report not found');
        }
    }

    /**
     * 
     */
    async orderStats() {
        const result = await this.model.orderStats();
        
        this.response.success(result);
    }

    /**
     * 
     */
    async topProducts() {
       const result = await this.model.topProducts();
        
        this.response.success(result);
    }

    /**
     * 
     */
    async recentOrders() {
         const result = await this.model.recentOrders();
        
        this.response.success(result);
    }
}

module.exports = ReportController;