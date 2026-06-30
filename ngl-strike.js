#!/usr/bin/env node

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const url = require('url');
const EventEmitter = require('events');
const readline = require('readline');

/**
 * @class NglError
 */
class NglError extends Error {
	/**
	 * constructor(msg, code)
	 * @param {*} msg - Description
	 * @param {*} code - Description
	 * @returns {*} Description
	 */
	constructor(msg, code = 'NGL_ERR') {
		/**
		 * super(msg)
		 * @param {*} msg - Description
		 * @returns {*} Description
		 */
		super(msg);
		this.name = 'NglError';
		this.code = code;
	}
}

/**
 * @class Logger
 */
class Logger {
	constructor(prefix = 'NGL-Strike') {
		this.prefix = prefix;
	}

	/**
	 * ts()
	 * @returns {*} Description
	 */
	ts() {
		const d = new Date();
		/**
		 * p(n)
		 * @param {*} n - Description
		 * @returns {*} Description
		 */
		const p = (n) => String(n).padStart(2, '0');
		return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}|${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
	}

	/**
	 * _out(level, args)
	 * @param {*} level - Description
	 * @param {*} args - Description
	 * @returns {*} Description
	 */
	_out(level, ...args) {
		const msg = args.join(' ');
		const t = this.ts();
		if (level === 'error') console.error(`[${t}][${this.prefix}]`, msg);
		else console.log(`[${t}][${this.prefix}]`, msg);
		return {
			level,
			timestamp: t,
			message: msg
		};
	}

	/**
	 * info(a)
	 * @param {*} a - Description
	 * @returns {*} Description
	 */
	info(...a) {
		return this._out('info', ...a);
	}
	/**
	 * warn(a)
	 * @param {*} a - Description
	 * @returns {*} Description
	 */
	warn(...a) {
		return this._out('warn', ...a);
	}
	/**
	 * error(a)
	 * @param {*} a - Description
	 * @returns {*} Description
	 */
	error(...a) {
		return this._out('error', ...a);
	}
	/**
	 * success(a)
	 * @param {*} a - Description
	 * @returns {*} Description
	 */
	success(...a) {
		return this._out('success', ...a);
	}
}

/**
 * @class Randomizer
 */
class Randomizer {
	static int(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static uuid() {
		return crypto.randomUUID();
	}
	static hex(len) {
		return crypto.randomBytes(len).toString('hex');
	}

	static userAgent() {
		const osList = [{
				name: 'Windows NT 10.0; Win64; x64',
				platform: 'Windows',
				mobile: false
			},
			{
				name: 'Windows NT 10.0; Win64; x64; rv:109.0',
				platform: 'Windows',
				mobile: false
			},
			{
				name: 'Macintosh; Intel Mac OS X 10_15_7',
				platform: 'macOS',
				mobile: false
			},
			{
				name: 'Macintosh; Intel Mac OS X 10_14_6',
				platform: 'macOS',
				mobile: false
			},
			{
				name: 'iPhone; CPU iPhone OS 17_5_1 like Mac OS X',
				platform: 'iOS',
				mobile: true
			},
			{
				name: 'iPhone; CPU iPhone OS 16_6 like Mac OS X',
				platform: 'iOS',
				mobile: true
			},
			{
				name: 'iPad; CPU OS 17_5_1 like Mac OS X',
				platform: 'iPad',
				mobile: false
			},
			{
				name: 'Linux; Android 14; Pixel 8',
				platform: 'Android',
				mobile: true
			},
			{
				name: 'Linux; Android 13; SM-G998B',
				platform: 'Android',
				mobile: true
			},
		];
		const os = osList[Randomizer.int(0, osList.length - 1)];
		const br = Randomizer.int(0, 2);
		const base = `Mozilla/5.0 (${os.name})`;
		let ua, sec, plat;
		const mobile = os.mobile ? '?1' : '?0';
		if (br === 0) {
			const v = Randomizer.int(120, 146);
			ua = `${base} AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Safari/537.36`;
			sec = `"Not-A.Brand";v="24", "Chromium";v="${v}"`;
			plat = `"${os.platform}"`;
		} else if (br === 1) {
			const v = Randomizer.int(115, 127);
			ua = `${base}; rv:${v}.0) Gecko/20100101 Firefox/${v}.0`;
			sec = `"Not-A.Brand";v="24", "Gecko";v="${v}"`;
			plat = `"${os.platform}"`;
		} else {
			const v = Randomizer.int(16, 17);
			ua = `${base} AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${v}.0 Mobile/15E148 Safari/605.1.15`;
			sec = `"Not-A.Brand";v="24", "WebKit";v="605"`;
			plat = `"${os.platform}"`;
		}
		return {
			ua,
			sec,
			plat,
			mobile
		};
	}

	static acceptLanguage() {
		const langs = [
			'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en;q=0.9',
			'en-US,en;q=0.9,es;q=0.8', 'en-GB,en;q=0.9,fr;q=0.8',
			'id,en;q=0.9', 'de,en;q=0.9', 'ja,en;q=0.9',
			'fr,en;q=0.9', 'zh-CN,zh;q=0.9,en;q=0.8',
		];
		return langs[Randomizer.int(0, langs.length - 1)];
	}

	static mixpanelCookie(deviceId) {
		const project = 'e8e1a30fe6d7dacfa1353b45d6093a00';
		const payload = {
			distinct_id: `$device:${deviceId}`,
			$device_id: deviceId,
			$initial_referrer: Randomizer.int(0, 3) === 0 ? '$direct' : 'https://google.com',
			$initial_referring_domain: Randomizer.int(0, 3) === 0 ? '$direct' : 'google.com',
			__mps: {},
			__mpso: {},
			__mpus: {},
			__mpa: {},
			__mpu: {},
			__mpr: [],
			__mpap: [],
		};
		payload.__mpso = {
			$initial_referrer: payload.$initial_referrer,
			$initial_referring_domain: payload.$initial_referring_domain
		};
		return `mp_${project}_mixpanel=${encodeURIComponent(JSON.stringify(payload))}`;
	}

	static gaCookie() {
		const clientId = Randomizer.int(100000000, 999999999);
		const firstVisit = Math.floor(Date.now() / 1000) - Randomizer.int(0, 31536000);
		return `_ga=GA1.1.${clientId}.${firstVisit}`;
	}

	static ga4Cookie() {
		const container = '5DV1ZR5ZHG';
		const now = Math.floor(Date.now() / 1000);
		const sessionStart = now - Randomizer.int(0, 7200);
		const lastInteraction = now - Randomizer.int(0, 300);
		const order = Randomizer.int(1, 15);
		const engagement = Randomizer.int(10, 300);
		const gParam = Math.random() > 0.8 ? '1' : '0';
		return `_ga_${container}=GS2.1.s${sessionStart}$o${order}$g${gParam}$t${lastInteraction}$j${engagement}$l0$h0`;
	}

	static generateSessionCookies(deviceId) {
		return {
			mixpanel: Randomizer.mixpanelCookie(deviceId),
			ga: Randomizer.gaCookie(),
			ga4: Randomizer.ga4Cookie(),
		};
	}
}

/**
 * @class Config
 */
class Config {
	static get defaults() {
		return {
			user: null,
			msg: 'Mxhytz was here.',
			count: 100,
			speed: 1,
			retries: 2,
			verbose: false,
			proxy: false,
		};
	}

	static validate(raw) {
		const validated = {
			...raw
		};
		if (validated.user && validated.user.startsWith('http')) {
			try {
				validated.user = new URL(validated.user).pathname.replace(/^\//, '');
			} catch (_) {
				throw new NglError(`Invalid URL: ${raw.user}`, 'INVALID_URL');
			}
		}
		if (validated.count !== undefined && (!Number.isInteger(validated.count) || validated.count < 1)) {
			throw new NglError(`Count must be positive (got ${validated.count})`, 'INVALID_COUNT');
		}
		if (validated.speed !== undefined && (typeof validated.speed !== 'number' || validated.speed < 0)) {
			throw new NglError(`Speed must be >= 0 (got ${validated.speed})`, 'INVALID_SPEED');
		}
		if (validated.retries !== undefined && (!Number.isInteger(validated.retries) || validated.retries < 0)) {
			throw new NglError(`Retries must be non-negative (got ${validated.retries})`, 'INVALID_RETRIES');
		}
		return validated;
	}
}

/**
 * @class ProxyManager
 */
class ProxyManager {
	constructor(logger) {
		this.logger = logger || new Logger();
		this.proxies = [];
		this.index = 0;
		this.proxyListUrl = 'https://raw.githubusercontent.com/iplocate/free-proxy-list/heads/main/all-proxies.txt';
		this.agents = {};
	}

	/**
	 * fetchProxies()
	 * @returns {*} Description
	 */
	async fetchProxies() {
		this.logger.info('Fetching proxy list...');
		try {
			const response = await new Promise((resolve, reject) => {
				const req = https.get(this.proxyListUrl, (res) => {
					let data = '';
					res.on('data', (chunk) => data += chunk);
					res.on('end', () => resolve(data));
				});
				req.on('error', reject);
				req.end();
			});
			const lines = response.split('\n').filter(line => line.trim());
			this.proxies = lines
				.map(line => {
					const match = line.match(/^(https?|socks4|socks5):\/\/(.+)$/);
					if (!match) return null;
					return {
						protocol: match[1],
						address: match[2]
					};
				})
				.filter(p => p !== null);
			if (this.proxies.length === 0) throw new Error('No proxies found');
			this.logger.info(`Loaded ${this.proxies.length} proxies`);
			return this.proxies;
		} catch (err) {
			this.logger.error(`Failed to fetch proxies: ${err.message}`);
			this.proxies = [];
			return [];
		}
	}

	/**
	 * getNextProxy()
	 * @returns {*} Description
	 */
	getNextProxy() {
		if (this.proxies.length === 0) return null;
		const proxy = this.proxies[this.index % this.proxies.length];
		this.index++;
		return proxy;
	}

	/**
	 * createAgent(proxy)
	 * @param {*} proxy - Description
	 * @returns {*} Description
	 */
	createAgent(proxy) {
		if (!proxy) return null;
		const {
			protocol,
			address
		} = proxy;
		let AgentClass;
		if (protocol === 'http' || protocol === 'https') {
			try {
				const {
					HttpsProxyAgent
				} = require('https-proxy-agent');
				AgentClass = HttpsProxyAgent;
			} catch (_) {
				this.logger.error('https-proxy-agent not installed. Run: npm install https-proxy-agent');
				return null;
			}
		} else if (protocol === 'socks4' || protocol === 'socks5') {
			try {
				const {
					SocksProxyAgent
				} = require('socks-proxy-agent');
				AgentClass = SocksProxyAgent;
			} catch (_) {
				this.logger.error('socks-proxy-agent not installed. Run: npm install socks-proxy-agent');
				return null;
			}
		} else {
			return null;
		}
		try {
			const agent = new AgentClass(`${protocol}://${address}`);
			return agent;
		} catch (_) {
			return null;
		}
	}
}

/**
 * @class SessionManager
 */
class SessionManager {
	constructor(logger) {
		this.logger = logger || new Logger();
		this.cookie = null;
		this.deviceId = null;
	}

	/**
	 * acquire(username)
	 * @param {*} username - Description
	 * @returns {*} Description
	 */
	async acquire(username) {
		const ua = Randomizer.userAgent();
		const lang = Randomizer.acceptLanguage();
		const deviceId = Randomizer.uuid();
		const generatedCookies = Randomizer.generateSessionCookies(deviceId);

		const options = {
			hostname: 'ngl.link',
			path: `/${username}`,
			method: 'GET',
			headers: {
				'User-Agent': ua.ua,
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': lang,
				'Accept-Encoding': 'gzip, deflate, br',
				'Sec-Ch-Ua': ua.sec,
				'Sec-Ch-Ua-Mobile': ua.mobile,
				'Sec-Ch-Ua-Platform': ua.plat,
				'Upgrade-Insecure-Requests': '1',
			},
		};

		const cookie = await new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				let cookieString = '';
				const setCookie = res.headers['set-cookie'];
				if (setCookie) {
					cookieString = setCookie.map(c => c.split(';')[0]).join('; ');
				}
				const fullCookie = cookieString ? cookieString + '; ' : '';
				const finalCookie = fullCookie + generatedCookies.mixpanel + '; ' + generatedCookies.ga + '; ' + generatedCookies.ga4;
				/**
				 * resolve(finalCookie)
				 * @param {*} finalCookie - Description
				 * @returns {*} Description
				 */
				resolve(finalCookie);
			});
			req.on('error', reject);
			req.end();
		});

		this.cookie = cookie;
		this.deviceId = deviceId;
		this.logger.info('Session acquired');
		return {
			cookie,
			deviceId
		};
	}

	/**
	 * getCookie()
	 * @returns {*} Description
	 */
	getCookie() {
		if (!this.cookie) throw new NglError('No session cookie', 'NO_SESSION');
		return this.cookie;
	}

	/**
	 * getDeviceId()
	 * @returns {*} Description
	 */
	getDeviceId() {
		if (!this.deviceId) throw new NglError('No device ID', 'NO_SESSION');
		return this.deviceId;
	}

	/**
	 * reset()
	 * @returns {*} Description
	 */
	reset() {
		this.cookie = null;
		this.deviceId = null;
	}
}

/**
 * @class HttpClient
 */
class HttpClient {
	constructor(logger) {
		this.logger = logger || new Logger();
	}

	/**
	 * send(options, postData, retries, agent)
	 * @param {*} options - Description
	 * @param {*} postData - Description
	 * @param {*} retries - Description
	 * @param {*} agent - Description
	 * @returns {*} Description
	 */
	async send(options, postData, retries = 1, agent = null) {
		let attempt = 0;
		/**
		 * backoff(attempt)
		 * @param {*} attempt - Description
		 * @returns {*} Description
		 */
		const backoff = (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000);
		while (attempt <= retries) {
			try {
				const requestOptions = {
					...options
				};
				if (agent) requestOptions.agent = agent;
				const response = await new Promise((resolve, reject) => {
					const req = https.request(requestOptions, (res) => {
						let data = '';
						res.on('data', (chunk) => (data += chunk));
						res.on('end', () => resolve({
							status: res.statusCode,
							statusMessage: res.statusMessage,
							data
						}));
					});
					req.on('error', reject);
					req.write(postData);
					req.end();
				});
				if (response.status >= 500 && attempt < retries) {
					throw new NglError(`Server error ${response.status}`, 'SERVER_ERROR');
				}
				return response;
			} catch (err) {
				if (attempt < retries) {
					await new Promise(r => setTimeout(r, backoff(attempt)));
					attempt++;
					continue;
				}
				throw new NglError(err.message, 'NETWORK_ERROR');
			}
		}
		throw new NglError('All retries failed', 'MAX_RETRIES');
	}
}

/**
 * @class RequestBuilder
 */
class RequestBuilder {
	static buildSubmit(username, question, deviceId, cookie, verbose = false) {
		const ua = Randomizer.userAgent();
		const lang = Randomizer.acceptLanguage();
		const payload = {
			username,
			question,
			deviceId,
			gameSlug: '',
			referrer: ''
		};
		const postData = new URLSearchParams(payload).toString();
		const options = {
			hostname: 'ngl.link',
			path: '/api/submit',
			method: 'POST',
			headers: {
				'Host': 'ngl.link',
				'Cookie': cookie,
				'Sec-Ch-Ua': ua.sec,
				'Sec-Ch-Ua-Mobile': ua.mobile,
				'Sec-Ch-Ua-Platform': ua.plat,
				'Accept-Language': lang,
				'X-Requested-With': 'XMLHttpRequest',
				'User-Agent': ua.ua,
				'Accept': '*/*',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Origin': 'https://ngl.link',
				'Sec-Fetch-Site': 'same-origin',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Dest': 'empty',
				'Referer': `https://ngl.link/${username}`,
				'Accept-Encoding': 'gzip, deflate, br',
				'Priority': 'u=1, i',
				'Content-Length': Buffer.byteLength(postData),
			},
		};
		if (verbose) {
			console.log('[VERBOSE] URL: https://ngl.link/api/submit');
			console.log('[VERBOSE] Headers:', JSON.stringify(options.headers, null, 2));
			console.log('[VERBOSE] Body:', postData);
		}
		return {
			options,
			postData
		};
	}
}

/**
 * @class CliParser
 */
class CliParser {
	constructor(args) {
		this.args = args || process.argv.slice(2);
		this.validFlags = ['-u', '--user', '-m', '--msg', '-c', '--count', '-s', '--speed', '-r', '--retries', '-v', '--verbose', '-p', '--proxy', '-h', '--help'];
		this.flagMap = {
			'--user': '-u',
			'--msg': '-m',
			'--count': '-c',
			'--speed': '-s',
			'--retries': '-r',
			'--verbose': '-v',
			'--proxy': '-p',
		};
	}

	/**
	 * parse()
	 * @returns {*} Description
	 */
	parse() {
		if (this.args.includes('-h') || this.args.includes('--help')) {
			this.showHelp();
			process.exit(0);
		}
		const tokens = [];
		for (let i = 0; i < this.args.length; i++) {
			const arg = this.args[i];
			if (arg.startsWith('--') || arg.startsWith('-')) {
				const key = arg.startsWith('--') ? (this.flagMap[arg] || arg) : arg;
				if (this.validFlags.includes(key)) {
					const next = this.args[i + 1];
					if (next && !next.startsWith('-')) {
						tokens.push(key, next);
						i++;
					} else if (key === '-v' || key === '--verbose' || key === '-p' || key === '--proxy') {
						tokens.push(key, 'true');
					}
				}
			}
		}
		const parsed = {};
		for (let i = 0; i < tokens.length; i += 2) {
			const flag = tokens[i];
			const val = tokens[i + 1];
			if (flag === '-u' || flag === '--user') parsed.user = val;
			else if (flag === '-m' || flag === '--msg') parsed.msg = val;
			else if (flag === '-c' || flag === '--count') {
				const c = parseInt(val, 10);
				if (!isNaN(c) && c > 0) parsed.count = c;
				else throw new NglError(`Invalid count: ${val}`, 'INVALID_COUNT');
			} else if (flag === '-s' || flag === '--speed') {
				const s = parseFloat(val);
				if (!isNaN(s) && s >= 0) parsed.speed = s;
				else throw new NglError(`Invalid speed: ${val}`, 'INVALID_SPEED');
			} else if (flag === '-r' || flag === '--retries') {
				const r = parseInt(val, 10);
				if (!isNaN(r) && r >= 0) parsed.retries = r;
				else throw new NglError(`Invalid retries: ${val}`, 'INVALID_RETRIES');
			} else if (flag === '-v' || flag === '--verbose') parsed.verbose = true;
			else if (flag === '-p' || flag === '--proxy') parsed.proxy = true;
		}
		return parsed;
	}

	/**
	 * showHelp()
	 * @returns {*} Description
	 */
	showHelp() {
		console.log(`
NGL-Strike – send multiple anonymous questions to an NGL user.

Usage:
  node ngl-strike.js -u <username> -m <message> [-c <count>] [-s <speed>] [-r <retries>] [-p] [-v]
  node ngl-strike.js --user <username> --msg <message> [--count <count>] [--speed <speed>] [--retries <retries>] [--proxy] [--verbose]
  node ngl-strike.js -h | --help

Options:
  -u, --user     Target username or full NGL link (required)
  -m, --msg      Question to send (default: "Mxhytz was here.")
  -c, --count    Number of messages (default: 100)
  -s, --speed    Delay between requests in seconds (default: 1)
  -r, --retries  Number of retry attempts on network error (default: 2)
  -p, --proxy    Enable proxy rotation (fetches proxies from free list)
  -v, --verbose  Show verbose request/response details
  -h, --help     Show this help

Examples:
  node ngl-strike.js -u user -m "hi" -c 50 -s 0.2 -p
`);
	}
}

/**
 * @class PromptHandler
 */
class PromptHandler {
	constructor(logger) {
		this.logger = logger || new Logger();
	}

	/**
	 * ask(question, validator, errorMsg, try again.')
	 * @param {*} question - Description
	 * @param {*} validator - Description
	 * @param {*} errorMsg - Description
	 * @param {*} try again.' - Description
	 * @returns {*} Description
	 */
	async ask(question, validator = null, errorMsg = 'Invalid input, try again.') {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		return new Promise((resolve) => {
			const ask = () => {
				rl.question(question, (input) => {
					const trimmed = input.trim();
					if (trimmed === '' && validator) {
						resolve(null);
						rl.close();
						return;
					}
					if (!validator) {
						resolve(trimmed);
						rl.close();
						return;
					}
					try {
						const result = validator(trimmed);
						if (result !== undefined) {
							resolve(result);
							rl.close();
							return;
						}
					} catch (_) {}
					this.logger.error(errorMsg);
					ask();
				});
			};
			ask();
		});
	}

	/**
	 * promptAll(defaults)
	 * @param {*} defaults - Description
	 * @returns {*} Description
	 */
	async promptAll(defaults) {
		const config = {};
		const user = await this.ask(
			'Enter username or link: ',
			(v) => {
				if (v === '') throw new Error();
				return v;
			},
			'Username cannot be empty.'
		);
		config.user = user;

		const msg = await this.ask(`Enter question (default: "${defaults.msg}"): `);
		config.msg = (msg === null || msg === '') ? defaults.msg : msg;

		const count = await this.ask(
			`Enter count (default: ${defaults.count}): `,
			(v) => {
				if (v === '') return null;
				const n = Number(v);
				if (!Number.isInteger(n) || n < 1) throw new Error();
				return n;
			},
			'Count must be a positive integer.'
		);
		config.count = (count === null) ? defaults.count : count;

		const speed = await this.ask(
			`Enter delay in seconds (default: ${defaults.speed}): `,
			(v) => {
				if (v === '') return null;
				const n = parseFloat(v);
				if (isNaN(n) || n < 0) throw new Error();
				return n;
			},
			'Speed must be a number >= 0.'
		);
		config.speed = (speed === null) ? defaults.speed : speed;

		const retries = await this.ask(
			`Enter retry attempts (default: ${defaults.retries}): `,
			(v) => {
				if (v === '') return null;
				const n = Number(v);
				if (!Number.isInteger(n) || n < 0) throw new Error();
				return n;
			},
			'Retries must be a non-negative integer.'
		);
		config.retries = (retries === null) ? defaults.retries : retries;

		const proxy = await this.ask('Enable proxy rotation? (y/N): ');
		config.proxy = (proxy && proxy.toLowerCase() === 'y');

		return config;
	}
}

/**
 * @class NglStrike
 */
class NglStrike extends EventEmitter {
	constructor(dependencies = {}) {
		super();
		this.logger = dependencies.logger || new Logger('NGL-Strike');
		this.session = dependencies.session || new SessionManager(this.logger);
		this.httpClient = dependencies.httpClient || new HttpClient(this.logger);
		this.proxyManager = dependencies.proxyManager || new ProxyManager(this.logger);
		this.cliParser = dependencies.cliParser || new CliParser();
		this.promptHandler = dependencies.promptHandler || new PromptHandler(this.logger);

		this.config = {
			...Config.defaults
		};
		this.running = false;
		this.aborted = false;
		this.consecutive404 = 0;
		this.MAX_CONSECUTIVE_404 = 3;
	}

	/**
	 * strike(opts)
	 * @param {*} opts - Description
	 * @returns {*} Description
	 */
	async strike(opts = null) {
		if (opts) Object.assign(this.config, opts);
		try {
			await this._setup();
			const result = await this._execute();
			this._teardown();
			return result;
		} catch (err) {
			this._teardown();
			this.logger.error(`Fatal: ${err.message}`);
			this.emit('error', err);
			process.exit(1);
		}
	}

	/**
	 * _setup()
	 * @returns {*} Description
	 */
	async _setup() {
		if (this.cliParser.args.length > 0) {
			const parsed = this.cliParser.parse();
			Object.assign(this.config, parsed);
		} else {
			const prompted = await this.promptHandler.promptAll(Config.defaults);
			Object.assign(this.config, prompted);
		}

		this.config = Config.validate(this.config);

		if (this.config.proxy) {
			await this.proxyManager.fetchProxies();
			if (this.proxyManager.proxies.length === 0) {
				this.logger.warn('No proxies available. Proceeding without proxy.');
			}
		}

		this.logger.info(`Target: @${this.config.user}`);
		this.logger.info(`Message: "${this.config.msg}"`);
		this.logger.info(`Count: ${this.config.count}`);
		this.logger.info(`Delay: ${this.config.speed}s`);
		this.logger.info(`Retries: ${this.config.retries}`);
		this.logger.info(`Proxy: ${this.config.proxy ? 'Enabled' : 'Disabled'}`);

		this.logger.info('Obtaining session...');
		const {
			cookie,
			deviceId
		} = await this.session.acquire(this.config.user);
		this._cookie = cookie;
		this._deviceId = deviceId;
		if (this.config.verbose) {
			this.logger.info(`Device ID: ${this._deviceId}`);
			this.logger.info(`Cookie: ${this._cookie}`);
		}

		this.running = true;
		this.aborted = false;
		this._setupSignalHandlers();
	}

	/**
	 * _execute()
	 * @returns {*} Description
	 */
	async _execute() {
		const {
			user,
			msg,
			count,
			speed,
			retries,
			verbose
		} = this.config;
		const delayMs = speed * 1000;
		const total = count;
		let success = 0,
			failed = 0;
		this.consecutive404 = 0;

		for (let i = 1; i <= count && !this.aborted; i++) {
			let proxyAgent = null;
			if (this.config.proxy && this.proxyManager.proxies.length > 0) {
				const proxy = this.proxyManager.getNextProxy();
				if (proxy) {
					proxyAgent = this.proxyManager.createAgent(proxy);
					if (verbose) this.logger.info(`Using proxy: ${proxy.protocol}://${proxy.address}`);
				}
			}

			try {
				const {
					options,
					postData
				} = RequestBuilder.buildSubmit(user, msg, this._deviceId, this._cookie, verbose);
				const response = await this.httpClient.send(options, postData, retries, proxyAgent);
				const statusLine = `HTTP/${response.status === 200 ? '2' : '1'} ${response.status}`;

				if (response.status === 200) {
					success++;
					this.consecutive404 = 0;
					this.logger.success(`[${i}/${total}] ${statusLine}`);
					this.emit('progress', {
						index: i,
						total,
						status: 'success',
						code: response.status
					});
				} else {
					failed++;
					this.logger.warn(`[${i}/${total}] ${statusLine}`);
					this.emit('progress', {
						index: i,
						total,
						status: 'failed',
						code: response.status
					});
					if (response.status === 404) {
						this.consecutive404++;
						this.logger.error(`[${i}/${total}] 404 – user may not exist or disabled anonymous messages. (${this.consecutive404}/${this.MAX_CONSECUTIVE_404})`);
						if (this.consecutive404 >= this.MAX_CONSECUTIVE_404) {
							this.logger.info(`Resetting session and continuing after ${this.MAX_CONSECUTIVE_404} consecutive 404s...`);
							this.session.reset();
							this.logger.info('Obtaining new session...');
							const newSession = await this.session.acquire(user);
							this._cookie = newSession.cookie;
							this._deviceId = newSession.deviceId;
							if (verbose) {
								this.logger.info(`New Device ID: ${this._deviceId}`);
								this.logger.info(`New Cookie: ${this._cookie}`);
							}
							this.consecutive404 = 0;
							i--;
							continue;
						}
					}
				}
			} catch (err) {
				failed++;
				this.consecutive404 = 0;
				this.logger.error(`[${i}/${total}] ERROR: ${err.message}`);
				this.emit('progress', {
					index: i,
					total,
					status: 'error',
					error: err.message
				});
			}

			if (i < count && delayMs > 0 && !this.aborted) {
				await new Promise(r => setTimeout(r, delayMs));
			}
		}

		this.running = false;
		if (this.aborted) {
			this.logger.info(`Aborted. Success: ${success}, Failed: ${failed}`);
			this.emit('aborted', {
				success,
				failed
			});
		} else {
			this.logger.info(`Done. Success: ${success}, Failed: ${failed}`);
			this.emit('done', {
				success,
				failed
			});
		}
		return {
			success,
			failed
		};
	}

	/**
	 * _teardown()
	 * @returns {*} Description
	 */
	_teardown() {
		this.running = false;
		this.session.reset();
	}

	/**
	 * _setupSignalHandlers()
	 * @returns {*} Description
	 */
	_setupSignalHandlers() {
		if (this._signalSetup) return;
		this._signalSetup = true;
		/**
		 * handler()
		 * @returns {*} Description
		 */
		const handler = () => {
			if (this.running) {
				console.log('\n[NGL-Strike] Interrupted. Finishing current request then exiting...');
				this.aborted = true;
			} else {
				process.exit(0);
			}
		};
		process.on('SIGINT', handler);
		process.on('SIGTERM', handler);
	}
}

if (require.main === module) {
	const strike = new NglStrike();
	strike.strike()
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

module.exports = {
	NglStrike,
	NglError
};