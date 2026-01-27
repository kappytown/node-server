const config ={
	DATABASE: {
		TYPE: process.env.DB_TYPE || 'mysql',
		HOST: process.env.DB_HOST || 'localhost',
		PORT: process.env.DB_PORT || 3306,
		USER: process.env.DB_USER || 'api_user',
		PASSWORD: process.env.DB_PASSWORD || 'api_password',
		DATABASE: process.env.DB_NAME || 'api_db'
	}
}

module.exports = config;