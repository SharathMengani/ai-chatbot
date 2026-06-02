import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: false,
    },

    image: {
        type: String,
        default: "",
    },

    provider: {
        type: String,
        enum: ["credentials", "google"],
        default: "credentials",
    },
});

export const User =
    models.User || model("User", UserSchema);