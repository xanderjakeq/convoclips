const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
require("dotenv").config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs
  .readdirSync("./dist/commands")
  .filter((file) => file.endsWith(".js"));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./dist/commands/${file}`);
  commands.push(command.data.toJSON());
  console.log(commands);
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    console.log("DEV", process.env.DEV);
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      process.env.DEV
        ? Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
          )
        : Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
