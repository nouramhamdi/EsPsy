const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    idevent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    iduser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Student: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide']
    },
    Event: {
        type: String,
        required: true,
        // Ce champ sera automatiquement rempli avec le titre de l'événement
    },
    date: {
        type: Date,
        required: true,
        // Ce champ sera automatiquement rempli avec la date de l'événement
    }
}, {
    timestamps: true
});

// Middleware pre-save pour remplir automatiquement Event et date depuis l'événement référencé
reservationSchema.pre('save', async function(next) {
    try {
        if (this.idevent) {
            const event = await mongoose.model('Event').findById(this.idevent);
            if (event) {
                this.Event = event.title;
                this.date = event.date;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);