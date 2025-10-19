<div align="center">

# Primal-Ape Bot

![primal ape](./primal.jpeg)

![GitHub watchers](https://img.shields.io/github/watchers/ryanfront/primal-ape?style=social)
![GitHub repo size](https://img.shields.io/github/repo-size/ryanfront/primal-ape)
![GitHub stars](https://img.shields.io/github/stars/ryanfront/primal-ape?style=social)
[![Baileys-Mod version](https://img.shields.io/npm/v/baileys-mod?style=flat)](https://www.npmjs.com/package/baileys-mod)

</div>

## Overview

This is a WhatsApp bot built using the Baileys library. It allows you to run custom commands, reload them without restarting, and keep the connection stable with automatic reconnection.

## Features

- Hot-reloading of commands (no restart required)
- Doesn't require prefix for commands
- Handles text, captions, and interactive messages
- Auto-reconnect when disconnected
- Simple command structure for easy extensions

## Setup

### Requirements

- Node.js 16 or newer
- A WhatsApp account

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the bot:
   ```
   node prime.js
   ```

## Usage

- On first run, enter your WhatsApp number.
- A pairing code will be displayed. Enter this in WhatsApp to connect.
- Place command files inside the `commands/` folder.

## Notes

- Commands reload automatically.
- Uncaught errors are handled silently for stability.

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
