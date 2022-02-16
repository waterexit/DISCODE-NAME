
import axios from 'axios';
axios
  .get('https://cdn.discordapp.com/ephemeral-attachments/943359566119317535/943365035663695902/a.txt')
  .then(res => {
    console.log(`statusCode: ${res.status}`)
    console.log(res.data)
  })
  .catch(error => {
    console.error(error)
  })