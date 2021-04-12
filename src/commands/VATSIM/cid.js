const { Command } = require("discord-akairo");
const MessageEmbed = require('../../Util/MessageEmbed');
const request = require("request");
const moment = require('moment');

module.exports = class CIDCommand extends Command {
  constructor() {
    super("cid", {
      cooldown: 5,
      description: {
        content: "Search a user by their CID",
        usage: "<cid>",
        examples: ["1234567"],
      },
      category: "VATSIM",
      aliases: ["cid", "user"],
      args: [
        {
          id: "cid",
          type: "cid",
          prompt: {
            start: "Enter a valid VATSIM CID",
            retry: "That is an invalid CID, try again",
          },
        },
      ],
    });
  }

  exec(message, args) {
    request(
      `https://api.vatsim.net/api/ratings/${args.cid}/`,
      { json: true },
      (err, res, mainBody) => {
        if (err) console.log(err);
        if (res.statusCode == 200) {
          request(
            `https://api.vatsim.net/api/ratings/${args.cid}/rating_times`,
            { json: true },
            (err, res, body) => {
              if (err) console.log(err);
              if (res.statusCode == 200) {
                const embed = MessageEmbed(`Results for CID: ${args.cid}`, message, this.client)
                  .addField(
                    "Name",
                    `${mainBody.name_first} ${mainBody.name_last}`
                  )
                  .addField(
                    "Controller Rating",
                    this.parseRating(mainBody.rating)
                  )
                  .addField(
                    "Pilot Rating",
                    this.parsePilotRating(mainBody.pilotrating)
                  )
                  .addField("Hours Controlling", this.parseTime(body.atc))
                  .addField("Hours Flying", this.parseTime(body.pilot));
                return message.channel.send(embed);
              }
            }
          );
        }
        else {
          console.log(mainBody);
        }
      }
    );
  }

  parseRating(rating) {
    switch (rating) {
      case -1:
        return "Inactive - `INAC`";
      case 0:
        return "Suspended - `SUS`";
      case 1:
        return "Observer - `OBS`";
      case 2:
        return "Tower Trainee - `S1`";
      case 3:
        return "Tower Controller - `S2`";
      case 4:
        return "Senior Student - `S3`";
      case 5:
        return "Enroute Controller - `C1`";
      case 6:
        return "Controller 2 - `C2`";
      case 7:
        return "Senior Controller - `C3`";
      case 8:
        return "Instructor - `I1`";
      case 9:
        return "Instructor 2 - `I2`";
      case 10:
        return "Senior Instructor - `I3`";
      case 11:
        return "Supervisor - `SUP`";
      case 12:
        return "Administrator - `ADM`";
      default:
        return "Unknown";
    }
  }

  parsePilotRating(rating) {
    switch (rating) {
      case 0:
        return "Basic Member - `NEW`";
      case 1:
        return "Private Pilot Licence - `PPL`";
      case 3:
        return "Instrument Rating - `IR`";
      case 7:
        return "Commercial Multi-Engine License - `CMEL`";
      case 15:
        return "Airline Transport Pilot License - `ATPL`";
      default:
        return "Unknown";
    }
  }

  parseTime(time) {
    var sign = time < 0 ? "-" : "";
    var hour = Math.floor(Math.abs(time));
    var min = Math.floor((Math.abs(time) * 60) % 60);
    return (
      sign + (hour < 10 ? "0" : "") + hour + ":" + (min < 10 ? "0" : "") + min
    );
  }
};
