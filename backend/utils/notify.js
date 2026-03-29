// utils/notify.js
import axios from "axios";

export async function sendSlackAlert(message) {
  await axios.post(process.env.SLACK_WEBHOOK, {
    text: message,
  });
}
