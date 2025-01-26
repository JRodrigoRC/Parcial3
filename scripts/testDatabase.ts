import connectDB from "../lib/mongodb"; // Ajusta la ruta según la estructura de tu proyecto
import User from "../models/User";
import Coordenada from "../models/Coordenada";
import LoginLog from "../models/LoginLog";
import bcrypt from "bcryptjs";

const testDatabase = async () => {
  try {
    // Conexión a la base de datos
    await connectDB();
    console.log("Conexión exitosa a la base de datos");

    // Crear un usuario de prueba con contraseña encriptada
    const hashedPassword = await bcrypt.hash("mi_contraseña_segura", 10);
    const newUser = await User.create({
      email: "testuser@example.com",
      password: hashedPassword,
      name: "Test User",
      image: "https://example.com/profile.jpg",
    });
    console.log("Usuario creado:", newUser);

    // Crear una coordenada de prueba
    const newCoordenada = await Coordenada.create({
      nombre: "Ubicación de Prueba",
      timestamp: new Date(),
      lat: 40.7128,
      lon: -74.006,
      creador: newUser.email,
      imagen: "https://example.com/image.jpg",
      lugar: "Nueva York",
    });
    console.log("Coordenada creada:", newCoordenada);

    // Crear un log de inicio de sesión
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // Token válido por 24 horas
    const newLoginLog = await LoginLog.create({
      userEmail: newUser.email,
      expiryTimestamp: expiryDate,
      token: "token_de_prueba",
    });
    console.log("Log de inicio de sesión creado:", newLoginLog);

    console.log("Prueba completada con éxito");
  } catch (error) {
    console.error("Error durante la prueba:", error);
  } finally {
    process.exit(0); // Finaliza el proceso
  }
};

testDatabase();
