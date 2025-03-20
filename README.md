# Alternative-wiz-control

![App Screenshot](https://github.com/muhammad-shalahuddin-amrullah/alternative-wiz-control/blob/main/Preview/Screen.jpg?raw=true)

A custom alternative to control Wiz-connected devices using your own API proxy. When the default Wiz API doesn’t work as expected, this solution provides a seamless way to manage your smart lighting and other connected devices using a modern, responsive interface.

## Overview
The Smart Home IoT Dashboard offers:
- **Real-time control**: Toggle power, adjust brightness, and change temperature with intuitive slider controls.
- **Scene management**: Activate preset scenes (e.g., Night Light) with a single click.
- **Live state feedback**: See current device status and connection state.
- **Custom backend API**: Uses a Cloudflare Worker to forward requests to the Wiz API and persist state using KV storage.

## Pre-Installation
Before installing the dashboard, ensure you complete the following steps:
- **Create a Wiz Account:**
   - Visit [Wiz Connected Dashboard](https://pro.wizconnected.com/dashboard/) and create an account.
   - Install the Wiz mobile app on your phone and create an account there as well.

- **Invite and Bind Devices:**
   - Invite the account on your phone to join the same building where your Wiz devices are located.
   - Bind your phone with your new Wiz lamp following the instructions in the app.

These steps ensure that your Wiz devices are properly configured and ready to be controlled via Website.

## Installation

- **Clone the Repository:**

   ```bash
   git clone https://github.com/muhammad-shalahuddin-amrullah/alternative-wiz-control.git

- **Set Up Cloudflare Worker:**

   - Log in to your Cloudflare account.
   - Create a new Worker and paste the code from the provided worker script.
   - Set up a KV namespace (e.g., STATE_KV) and bind it to your Worker.
   - Bind organizationId, Cookie (connect.sid), lightId, macAddress of your lamp to your worker
        *To get organizationId, Cookie (connect.sid), lightId, macAddress, you can use this tool [Wiz Inspector Extension](https://github.com/muhammad-shalahuddin-amrullah/Wiz-Inspector)*


- **Deploy:**

   - Deploy the Worker via the Cloudflare dashboard or using Wrangler.
   - Update the endpoint URL in the dashboard code (the HTML file) to match your deployed Worker URL.

-  **Serve the Frontend:**

   - You can host the HTML file on any static hosting provider (e.g., GitHub Pages, Netlify, Vercel).

## Usage
- **Power Toggle**: Turn the living room lamp on or off.  
- **Brightness Slider**: Adjust the brightness level from 1% to 100%.  
- **Temperature Slider**: Set the lamp color temperature between 2000K and 6500K.  
- **Scenes**: Activate preset scenes like “Night Light” with a single click.  

## State Persistence:
The current state is stored using **Cloudflare Workers KV**, ensuring that your device settings persist between sessions. 

## Contributing
Feel free to fork this repository and submit pull requests for improvements or additional features.  
