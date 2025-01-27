import mongoose from "mongoose";

const CoordenadaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    creador: {
      type: String,
      required: true,
    },
    imagen: {
      type: String,
    },
    lugar: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Coordenada =
  mongoose.models?.Coordenada || mongoose.model("Coordenada", CoordenadaSchema);

export default Coordenada;