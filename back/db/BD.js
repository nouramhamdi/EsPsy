const mongoose = require('mongoose')


module.exports.connectToMongoDB = () => {
    mongoose.set('strictQuery',false);
    mongoose.connect(process.env.URL_MONGO).then(
        () => {console.log("database connected  successfully ! ");}
    ).catch(
        (error) => {console.log(error.message);}
    )
}