import ImageKit from 'imagekit';


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// imagekit.listFiles({ limit: 1 }, (err, result) => {
//   if (err) console.error(" ImageKit Auth Failed:", err);
//   else console.log(" ImageKit Auth Works:", result);
// });

export default imagekit;
