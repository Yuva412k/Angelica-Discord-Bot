module.exports = async (client) => {
  console.log(`[BOT] Logged in as ${client.user.username}`);
  await client.user.setActivity("Music", {
    type: "PLAYING",//can be LISTENING, WATCHING, PLAYING, STREAMING
  });
};
