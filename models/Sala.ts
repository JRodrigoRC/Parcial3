import mongoose from "mongoose";
// Modelo de Sala
const SalaSchema = new mongoose.Schema(
    {
      nombre: {
        type: String,
        required: true,
      },
      direccion: {
        type: String,
        required: true,
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
  
  const Sala = mongoose.models?.Sala || mongoose.model("Sala", SalaSchema);
  
  export default Sala;