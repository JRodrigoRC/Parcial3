import mongoose from "mongoose";

// Modelo de Película
const PeliculaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    cartel: {
      type: String,
    },
    propietario: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Pelicula =
 mongoose.models?.Pelicula || mongoose.model("Pelicula", PeliculaSchema);

export default Pelicula;