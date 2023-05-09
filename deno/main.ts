// deno-lint-ignore-file require-await
import { serve } from "https://deno.land/std@0.180.0/http/server.ts";

import "https://deno.land/std@0.180.0/dotenv/load.ts";

const handler = async (req: Request): Promise<Response> => {
	const upgrade = req.headers.get("upgrade") || "";
	if (upgrade.toLowerCase() != "websocket") {
		return new Response("request isn't trying to upgrade to websocket.");
	}

	const { socket, response } = Deno.upgradeWebSocket(req);
	const channel = new BroadcastChannel("message_channel");
	channel.onmessage = (event: MessageEvent) => {
		if (socket.readyState == 1) {
			socket.send(event.data);
		}
	};
	socket.onopen = () => {
		channel.postMessage(
			JSON.stringify({
				type: "USER_CONNECT",
			})
		);
		socket.send(
			JSON.stringify({
				type: "SELF_CONNECT",
			})
		);
	};
	socket.onmessage = (e) => {
		const message = JSON.parse(e.data);
		if (message.type == "DATA") {
			channel.postMessage(JSON.stringify(message));
		}
		socket.send(JSON.stringify(message));
	};
	socket.onerror = (e) => console.log("socket errored:", e);
	socket.onclose = () => {
		channel.postMessage(
			JSON.stringify({
				type: "USER_DISCONNECT",
			})
		);
	};
	return response;
};

serve(handler);
