const { Command } = require("discord-akairo");

module.exports = class VATHelpCommand extends Command {
  constructor() {
    super("vathelp", {
      cooldown: 5,
      description: {
        content:
          "Some useful links and instructions for getting started on VATSIM",
      },
      category: "VATSIM",
      aliases: ["vathelp"],
    });
  }
  exec(message) {
    return message.channel.send(
      "Below you can find some links/instructions to get yourself up and running on the VATSIM Network\n\nFirstly you will need to set yourself up with an account, if you do not have one you can do that here: https://cert.vatsim.net/vatsimnet/signup.html\nYou will also need to familiarise yourself with the VATSIM Code of Conduct and Code of Regulations, which can be found here: https://www.vatsim.net/documents along with other documents such as the Privacy Policy and Data Protection Policy.\nYou will then want to familiarise yourself with the Pilot Resource Center which has many useful pages for new pilots, this can be found here: https://www.vatsim.net/pilot-resource-centre\n\nNext you will want to get yourself a pilot client, there are many to choose from depending on what simulator you use, a list of all the clients and their respective simulators can be found here: https://www.vatsim.net/pilots/download-required-software\nOnce you've done that you can connect to VATSIM, make sure you are __NOT__ parked on a runway or taxiway as you may conflict with traffic when you connect.\nConnecting to the network is very simple but differs from client to client, you will most likely need your VATSIM CID and password which should have been sent to you upon registration. More detailed instructions on connecting can be found in the documents for your specific client.\n\nAnd thats it, you can now get yourself up and running on VATSIM, if you are nervous, do not worry. Just sit on the ground and 'observe' a frequency and you will soon work out what everything means."
    );
  }
};
