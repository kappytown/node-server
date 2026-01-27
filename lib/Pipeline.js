/**
 * Pipeline utility for executing middleware chains
 */
class Pipeline {
	/**
     * Executes the middleware in the order they are placed in the array
	 * 
     * @param {Request} req
     * @param {Response} res
     * @param {Array} middlewares
     * @param {Function} target
     */
    static async run(req, res, middlewares, target) {
        let index = 0;

        const next = async () => {
			//if (res.res.writableEnded) return; // Stop if already responded

            if (index < middlewares.length) {
                const middleware = middlewares[index++];

                // Call the middleware
                await middleware(req, res, next);

            } else {
                await target();
            }
        };

        await next();
    }
}

module.exports = Pipeline;