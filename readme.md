
# NGL-Strike

> Send multiple anonymous messages to an NGL.link user.

NGL-Strike is a Node.js automation tool that simulates sending anonymous questions through the NGL.link web interface. It supports proxy rotation, random user‑agent/browser fingerprints, session management, retries, and graceful interruption.

---

## Features

- **Bulk message sending**: Send a configurable number of messages with a single command.
- **Session acquisition**: Mimics real browser sessions (cookies, device ID, analytics).
- **Randomised fingerprints**: Rotates User‑Agent, Accept‑Language, and sets fake Mixpanel / Google Analytics cookies.
- **Proxy support**: Fetches a free proxy list and rotates requests through HTTP/SOCKS proxies.
- **Automatic retry**: Retries failed requests with exponential backoff.
- **Consecutive 404 detection**: Resets the session and continues if the target appears to be missing or disabled.
- **Interactive mode**: Runs an interactive prompt if no CLI arguments are given.
- **Verbose logging**: Use `-v` to see full request/response details.

---

## Requirements

- **Node.js** ≥ 16.0.0
- **npm** (or yarn)

Optional dependencies for proxy support:
- [`https-proxy-agent`](https://www.npmjs.com/package/https-proxy-agent) (for HTTP/HTTPS proxies)
- [`socks-proxy-agent`](https://www.npmjs.com/package/socks-proxy-agent) (for SOCKS4/SOCKS5 proxies)

These are listed in `package.json` and will be installed automatically if you run `npm install`.

---

## Installation

```bash
git clone https://github.com/Mxhytz/ngl-strike.git
cd ngl-strike
npm install
```

Make the script executable (optional):
```bash
chmod +x ngl-strike.js
```

---

## Usage

### Basic command line

```bash
node ngl-strike.js -u <username> -m <message> [options]
```

If you run the script **without arguments**, an interactive prompt will ask for all required parameters.

### Options

| Flag (short) | Flag (long) | Description | Default |
|--------------|-------------|-------------|---------|
| `-u`         | `--user`    | Target NGL username or full link (e.g., `user` or `https://ngl.link/user`) | *required* |
| `-m`         | `--msg`     | The message / question to send | `"Mxhytz was here."` |
| `-c`         | `--count`   | Number of messages to send | `100` |
| `-s`         | `--speed`   | Delay between requests in seconds (can be 0) | `1` |
| `-r`         | `--retries` | Number of retry attempts per request | `2` |
| `-p`         | `--proxy`   | Enable proxy rotation (fetches free proxies) | disabled |
| `-v`         | `--verbose` | Verbose output (headers, body, etc.) | disabled |
| `-h`         | `--help`    | Show help and exit | |

### Examples

1. **Simple spam test**  
   Send 50 messages with a 0.2-second delay:
   ```bash
   node ngl-strike.js -u exampleuser -m "Hello there" -c 50 -s 0.2
   ```

2. **With proxy rotation and verbose output**  
   ```bash
   node ngl-strike.js -u exampleuser -m "Hi" -c 100 -p -v
   ```

3. **Interactive mode**  
   Just run `node ngl-strike.js` and follow the prompts.

---

## How it works

1. **Session acquisition** – A GET request to `https://ngl.link/<username>` sets a session cookie and collects browser‑like headers. Random Mixpanel and Google Analytics cookies are generated to further mimic a real browser.

2. **Message submission** – For each message, a POST request is sent to `https://ngl.link/api/submit` with the payload (username, question, device ID). Headers are randomised for each request to avoid easy detection.

3. **Response handling**  
   - `200` → success.  
   - Non‑`200` (e.g. `400`, `404`, `500`) → counted as failed; retried if `5xx` and retries remain.  
   - Consecutive `404` errors (default 3) → session is reset and the loop continues, in case the target’s settings have temporarily blocked.

4. **Signal handling** – Pressing `Ctrl+C` will gracefully abort the process after the current request finishes.

---

## Proxy support

Proxy rotation is off by default. Enable it with `-p` or `--proxy`.

- The script fetches a list from [iplocate/free-proxy-list](https://github.com/iplocate/free-proxy-list/blob/heads/main/all-proxies.txt) at startup.
- It rotates through HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.
- Ensure the required proxy agent modules are installed (they are included in `package.json`).

If the proxy list is empty or the modules are missing, the tool will continue without a proxy and log a warning.

---

## Disclaimer

**This tool is for educational and testing purposes only.**  
Sending unsolicited bulk messages may violate the terms of service of NGL.link and could be considered harassment. Use responsibly and only on accounts you own or have explicit permission to test. The author assumes no liability for misuse.

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details. (The `package.json` specifies MIT.)

---

## Author

**Mxhytz**  
GitHub: [@Mxhytz](https://github.com/Mxhytz)

---

*Made with curiosity*