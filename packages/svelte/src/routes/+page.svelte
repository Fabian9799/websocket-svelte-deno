<script lang="ts">
	import { onMount } from 'svelte';

	let messages: string[] = [];

	let ws: null | WebSocket = null;
	onMount(() => {
		function connect() {
			const url = 'ws://localhost:8000';
			ws = new WebSocket(url);

			// On Open
			ws.onopen = () => {
				if (!ws) return;
				ws.send(
					JSON.stringify({
						type: 'PING'
					})
				);
				console.log('Connected!');
			};

			// On Error
			ws.onerror = (error) => {
				console.log(`WebSocket error: ${error}`);
			};

			// On Close
			ws.onclose = () => {
				console.log('Disconnected!');
				// reconnect after 5 seconds
				setTimeout(() => {
					ws = null;
					connect();
				}, 5000);
			};

			// On Message
			ws.onmessage = (e) => {
				const payload = JSON.parse(e.data);
				if (payload.type == 'DATA') {
					messages.push(payload.message);
					messages = messages;
				}
			};
		}
		connect();

		return () => {
			if (!ws) return;
			ws.close();
		};
	});
	// Send data to websocket from outside function
	function send(message: string) {
		if (!ws) return;
		ws.send(
			JSON.stringify({
				type: 'DATA',
				message: message
			})
		);
	}

	let value = '';
</script>

<form
	on:submit|preventDefault={() => {
		send(value);
	}}
>
	<input bind:value type="text" />
	<button>Send</button>
</form>

<div>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>

<style>
	div {
		border: 1px solid black;
		padding: 20px;
	}
</style>
