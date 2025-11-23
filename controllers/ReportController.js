const AuthController  = require('./AuthController');
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
class ReportController extends AuthController {

    constructor(db, req, res) {
        super(db, req, res);

        this.model = new ReportModel(this.db);
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
        await this.authenticate();

        const result = await this.model.orderStats(this.userId);
        
        await this.db.close();
        this.response.success(result);
    }

    /**
     * 
     */
    async topProducts() {
        await this.authenticate();

        const result = await this.model.topProducts(this.userId);
        
        await this.db.close();
        this.response.success(result);
    }

    /**
     * 
     */
    async recentOrders() {
        await this.authenticate();

        const result = await this.model.recentOrders(this.userId);
        
        await this.db.close();
        this.response.success(result);
    }
}

module.exports = ReportController;