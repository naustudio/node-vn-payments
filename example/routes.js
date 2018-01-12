import { Router } from 'express';
import { OnePay } from '../src/onepay';
import { VNPay } from '../src/vnpay';

const routes = Router();

/**
 * GET home page
 */
routes.get('/', (req, res) => {
	res.render('index', { title: 'Express Babel' });
});

const onepayIntl = new OnePay({
	paymentGateway: 'https://mtf.onepay.vn/vpcpay/vpcpay.op',
	merchant: 'TESTONEPAY',
	accessCode: '6BEB2546',
	secureSecret: '6D0870CDE5F24F34F3915FB0045120DB',
	againLink: 'http://localhost:8080',
});

const onepayDom = new OnePay({
	paymentGateway: 'https://mtf.onepay.vn/onecomm-pay/vpc.op',
	merchant: 'ONEPAY',
	accessCode: 'D67342C2',
	secureSecret: 'A3EFDFABA8653DF2342E8DAC29B51AF0',
});

const vnpay = new VNPay({
	paymentGateway: 'http://sandbox.vnpayment.vn/paymentv2/vnppay.html',
	merchant: 'COCOSIN',
	secureSecret: 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
});

routes.post('/payment/checkout', (req, res) => {
	const userAgent = req.headers['user-agent'];
	console.log('userAgent', userAgent);

	const clientIp =
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);

	const params = Object.assign({}, req.body);

	const amount = parseInt(params.amount, 10);
	const now = new Date();

	const checkoutData = {
		amount,
		clientIp,
		locale: 'vn',
		againLink: '/',
		billingCity: '',
		billingCountry: '',
		billingPostCode: '',
		billingStateProvince: '',
		billingStreet: '',
		currency: 'VND',
		deliveryAddress: '',
		deliveryCity: '',
		deliveryCountry: '',
		customerEmail: params.email,
		customerPhone: params.phoneNumber,
		// deliveryProvince: '',
		orderId: `node-${now.toISOString()}`,
		returnUrl: `http://${req.headers.host}/payment/callback`,
		transactionId: `node-${now.toISOString()}`, // same as orderId (we don't have retry mechanism)
		customerId: params.email,
	};

	let checkoutMethod = '';
	switch (params.paymentMethod) {
		case 'onepayInternational':
			checkoutMethod = onepayIntl;
			break;
		case 'onepayDomestic':
			checkoutMethod = onepayDom;
			break;
		case 'vnpay':
			checkoutMethod = vnpay;
			break;
		default:
			break;
	}

	const checkoutUrl = checkoutMethod.buildCheckoutUrl(checkoutData);

	res.writeHead(301, { Location: checkoutUrl.href });
	res.end();
});

/**
 * GET /list
 *
 * This is a sample route demonstrating
 * a simple approach to error handling and testing
 * the global error handler. You most certainly want to
 * create different/better error handlers depending on
 * your use case.
 */
routes.get('/list', (req, res, next) => {
	const { title } = req.query;

	if (title == null || title === '') {
		// You probably want to set the response HTTP status to 400 Bad Request
		// or 422 Unprocessable Entity instead of the default 500 of
		// the global error handler (e.g check out https://github.com/kbariotis/throw.js).
		// This is just for demo purposes.
		next(new Error('The "title" parameter is required'));

		return;
	}

	res.render('index', { title });
});

export default routes;
