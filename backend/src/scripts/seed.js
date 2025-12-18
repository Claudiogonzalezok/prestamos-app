// src/scripts/seed.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// Importar modelos
import Financiera from "../models/Financiera.js";
import Usuario from "../models/Usuario.js";
import Cliente from "../models/Cliente.js";
import Prestamo from "../models/Prestamo.js";
import Cuota from "../models/Cuota.js";
import Pago from "../models/Pago.js";

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
  LIMPIAR_DB: true,
  PASSWORD_DEFAULT: "123456"
};

// ============================================
// DATOS DE SEED
// ============================================

const financieraData = {
  nombre: "Créditos del Norte",
  razonSocial: "Créditos del Norte SRL",
  cuit: "30-71234567-8",
  email: "info@creditosdelnorte.com",
  telefono: "0381-4567890",
  whatsapp: "+5493814567890",
  direccion: {
    calle: "San Martín",
    numero: "450",
    ciudad: "San Miguel de Tucumán",
    provincia: "Tucumán",
    codigoPostal: "4000"
  },
  configuracion: {
    tasasInteres: [
      { nombre: "Tasa Estándar", porcentaje: 5, tipo: "mensual" },
      { nombre: "Tasa Preferencial", porcentaje: 3.5, tipo: "mensual" },
      { nombre: "Tasa Promocional", porcentaje: 2.5, tipo: "mensual" }
    ],
    mora: {
      habilitada: true,
      porcentajeDiario: 0.5,
      diasGracia: 3
    },
    cancelacionAnticipada: {
      habilitada: true,
      descuentoPorDia: 0.1
    },
    frecuenciasPago: ["mensual", "quincenal"],
    montoMinimo: 50000,
    montoMaximo: 5000000,
    plazoMinimo: 3,
    plazoMaximo: 48
  },
  plan: "profesional",
  limiteClientes: 500,
  limiteUsuarios: 10
};

const usuariosData = [
  {
    nombre: "Carlos",
    apellido: "Administrador",
    email: "admin@creditosdelnorte.com",
    rol: "admin",
    telefono: "3814111111"
  },
  {
    nombre: "María",
    apellido: "González",
    email: "maria@creditosdelnorte.com",
    rol: "empleado",
    telefono: "3814222222",
    permisos: {
      crearPrestamos: true,
      editarPrestamos: false,
      eliminarPrestamos: false,
      registrarPagos: true,
      verReportes: true,
      gestionarClientes: true,
      gestionarUsuarios: false,
      configurarSistema: false
    }
  },
  {
    nombre: "Juan",
    apellido: "Cobrador",
    email: "juan@creditosdelnorte.com",
    rol: "cobrador",
    telefono: "3814333333",
    permisos: {
      crearPrestamos: false,
      editarPrestamos: false,
      eliminarPrestamos: false,
      registrarPagos: true,
      verReportes: false,
      gestionarClientes: false,
      gestionarUsuarios: false,
      configurarSistema: false
    }
  }
];

const clientesData = [
  {
    nombre: "Roberto",
    apellido: "Pérez",
    dni: "25123456",
    cuil: "20-25123456-7",
    fechaNacimiento: new Date("1975-05-15"),
    genero: "masculino",
    estadoCivil: "casado",
    email: "roberto.perez@email.com",
    telefono: "0381-4111222",
    celular: "3814111222",
    whatsapp: "+5493814111222",
    direccion: {
      calle: "Av. Aconquija",
      numero: "1234",
      barrio: "Yerba Buena",
      ciudad: "Yerba Buena",
      provincia: "Tucumán",
      codigoPostal: "4107"
    },
    ocupacion: "Comerciante",
    empleador: "Negocio propio",
    ingresoMensual: 450000,
    antiguedadLaboral: 120,
    calificacion: "A",
    estado: "activo"
  },
  {
    nombre: "Laura",
    apellido: "Martínez",
    dni: "30456789",
    cuil: "27-30456789-4",
    fechaNacimiento: new Date("1985-08-22"),
    genero: "femenino",
    estadoCivil: "soltero",
    email: "laura.martinez@email.com",
    celular: "3814222333",
    whatsapp: "+5493814222333",
    direccion: {
      calle: "Lamadrid",
      numero: "567",
      barrio: "Centro",
      ciudad: "San Miguel de Tucumán",
      provincia: "Tucumán",
      codigoPostal: "4000"
    },
    ocupacion: "Empleada administrativa",
    empleador: "Empresa XYZ SA",
    ingresoMensual: 380000,
    antiguedadLaboral: 36,
    calificacion: "B",
    estado: "activo"
  },
  {
    nombre: "Miguel",
    apellido: "Fernández",
    dni: "28789012",
    cuil: "20-28789012-5",
    fechaNacimiento: new Date("1980-03-10"),
    genero: "masculino",
    estadoCivil: "divorciado",
    email: "miguel.fernandez@email.com",
    celular: "3814333444",
    whatsapp: "+5493814333444",
    direccion: {
      calle: "24 de Septiembre",
      numero: "890",
      barrio: "Barrio Sur",
      ciudad: "San Miguel de Tucumán",
      provincia: "Tucumán",
      codigoPostal: "4000"
    },
    ocupacion: "Técnico electrónico",
    empleador: "TecnoService",
    ingresoMensual: 320000,
    antiguedadLaboral: 24,
    calificacion: "B",
    estado: "activo"
  },
  {
    nombre: "Ana",
    apellido: "López",
    dni: "32101234",
    cuil: "27-32101234-9",
    fechaNacimiento: new Date("1990-11-05"),
    genero: "femenino",
    estadoCivil: "casado",
    email: "ana.lopez@email.com",
    celular: "3814444555",
    whatsapp: "+5493814444555",
    direccion: {
      calle: "España",
      numero: "234",
      barrio: "Alberdi",
      ciudad: "San Miguel de Tucumán",
      provincia: "Tucumán",
      codigoPostal: "4000"
    },
    ocupacion: "Docente",
    empleador: "Escuela Provincial N°10",
    ingresoMensual: 290000,
    antiguedadLaboral: 60,
    calificacion: "A",
    estado: "activo"
  },
  {
    nombre: "Pedro",
    apellido: "Sánchez",
    dni: "27567890",
    cuil: "20-27567890-3",
    fechaNacimiento: new Date("1978-07-20"),
    genero: "masculino",
    estadoCivil: "casado",
    email: "pedro.sanchez@email.com",
    celular: "3814555666",
    whatsapp: "+5493814555666",
    direccion: {
      calle: "Córdoba",
      numero: "1567",
      barrio: "Centro",
      ciudad: "San Miguel de Tucumán",
      provincia: "Tucumán",
      codigoPostal: "4000"
    },
    ocupacion: "Contador",
    empleador: "Estudio Contable Asociados",
    ingresoMensual: 520000,
    antiguedadLaboral: 180,
    calificacion: "A",
    estado: "activo"
  },
  {
    nombre: "Carmen",
    apellido: "Ruiz",
    dni: "29234567",
    cuil: "27-29234567-1",
    fechaNacimiento: new Date("1982-01-30"),
    genero: "femenino",
    estadoCivil: "soltero",
    email: "carmen.ruiz@email.com",
    celular: "3814666777",
    direccion: {
      calle: "Mendoza",
      numero: "789",
      barrio: "Barrio Norte",
      ciudad: "San Miguel de Tucumán",
      provincia: "Tucumán",
      codigoPostal: "4000"
    },
    ocupacion: "Vendedora",
    empleador: "Tienda La Moda",
    ingresoMensual: 250000,
    antiguedadLaboral: 18,
    calificacion: "C",
    estado: "activo"
  }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function calcularCuotaFrances(capital, tasaMensual, plazo) {
  const r = tasaMensual / 100;
  return capital * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
}

function generarCuotas(prestamo, capital, tasaMensual, plazo, fechaPrimera) {
  const cuotaFija = calcularCuotaFrances(capital, tasaMensual, plazo);
  let saldo = capital;
  const cuotas = [];
  let fechaCuota = new Date(fechaPrimera);
  
  for (let i = 1; i <= plazo; i++) {
    const interes = saldo * (tasaMensual / 100);
    const capitalCuota = cuotaFija - interes;
    saldo -= capitalCuota;
    
    cuotas.push({
      financiera: prestamo.financiera,
      prestamo: prestamo._id,
      cliente: prestamo.cliente,
      numeroCuota: i,
      montoCuota: Math.round(cuotaFija * 100) / 100,
      capital: Math.round(capitalCuota * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      mora: 0,
      totalAPagar: Math.round(cuotaFija * 100) / 100,
      saldoPendiente: Math.round(cuotaFija * 100) / 100,
      fechaVencimiento: new Date(fechaCuota),
      saldoRestante: Math.round(Math.max(saldo, 0) * 100) / 100,
      estado: "pendiente"
    });
    
    fechaCuota.setMonth(fechaCuota.getMonth() + 1);
  }
  
  return cuotas;
}

// ============================================
// FUNCIÓN PRINCIPAL DE SEED
// ============================================

async function seed() {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("🌱 CREDITOSPRO - SEED DE DATOS");
    console.log("=".repeat(50) + "\n");
    
    // Conectar a MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI no está definida en .env");
    }
    
    console.log("📡 Conectando a MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB\n");
    
    // Limpiar base de datos
    if (CONFIG.LIMPIAR_DB) {
      console.log("🗑️  Limpiando base de datos...");
      await Promise.all([
        Pago.deleteMany({}),
        Cuota.deleteMany({}),
        Prestamo.deleteMany({}),
        Cliente.deleteMany({}),
        Usuario.deleteMany({}),
        Financiera.deleteMany({})
      ]);
      console.log("✅ Base de datos limpia\n");
    }
    
    // Crear Financiera
    console.log("🏢 Creando financiera...");
    const financiera = new Financiera(financieraData);
    await financiera.save();
    console.log(`   ✅ ${financiera.nombre}`);
    
    // Crear Usuarios
    console.log("\n👥 Creando usuarios...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(CONFIG.PASSWORD_DEFAULT, salt);
    
    const usuarios = [];
    for (const userData of usuariosData) {
      const usuario = new Usuario({
        ...userData,
        financiera: financiera._id,
        password: passwordHash,
        emailVerificado: true,
        activo: true
      });
      await usuario.save();
      usuarios.push(usuario);
      console.log(`   ✅ ${usuario.nombreCompleto} (${usuario.rol}) - ${usuario.email}`);
    }
    
    // Crear Clientes
    console.log("\n👤 Creando clientes...");
    const clientes = [];
    for (const clienteData of clientesData) {
      const cliente = new Cliente({
        ...clienteData,
        financiera: financiera._id,
        creadoPor: usuarios[0]._id,
        acceso: {
          habilitado: true,
          password: passwordHash
        }
      });
      await cliente.save();
      clientes.push(cliente);
      console.log(`   ✅ ${cliente.nombreCompleto} - DNI: ${cliente.dni}`);
    }
    
    // Crear Préstamos
    console.log("\n💰 Creando préstamos...");
    const prestamosConfig = [
      // Préstamo activo - Roberto Pérez - al día
      {
        cliente: clientes[0],
        monto: 500000,
        tasa: 5,
        plazo: 12,
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        estado: "activo",
        cuotasPagadas: 3
      },
      // Préstamo activo - Laura Martínez - al día
      {
        cliente: clientes[1],
        monto: 200000,
        tasa: 5,
        plazo: 6,
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        estado: "activo",
        cuotasPagadas: 2
      },
      // Préstamo atrasado - Miguel Fernández - 1 cuota vencida
      {
        cliente: clientes[2],
        monto: 300000,
        tasa: 5,
        plazo: 12,
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 4)),
        estado: "atrasado",
        cuotasPagadas: 3
      },
      // Préstamo activo - Ana López - reciente
      {
        cliente: clientes[3],
        monto: 150000,
        tasa: 3.5,
        plazo: 6,
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        estado: "activo",
        cuotasPagadas: 1
      },
      // Préstamo finalizado - Pedro Sánchez
      {
        cliente: clientes[4],
        monto: 400000,
        tasa: 5,
        plazo: 6,
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 8)),
        estado: "finalizado",
        cuotasPagadas: 6
      },
      // Préstamo activo nuevo - Carmen Ruiz - sin pagos aún
      {
        cliente: clientes[5],
        monto: 100000,
        tasa: 5,
        plazo: 6,
        fechaInicio: new Date(),
        estado: "activo",
        cuotasPagadas: 0
      }
    ];
    
    let totalPrestamos = 0;
    let totalCuotas = 0;
    let totalPagos = 0;
    
    for (const config of prestamosConfig) {
      // Calcular totales
      const cuotaFija = calcularCuotaFrances(config.monto, config.tasa, config.plazo);
      const totalAPagar = cuotaFija * config.plazo;
      const totalIntereses = totalAPagar - config.monto;
      
      const prestamo = new Prestamo({
        financiera: financiera._id,
        cliente: config.cliente._id,
        creadoPor: usuarios[0]._id,
        montoSolicitado: config.monto,
        montoAprobado: config.monto,
        montoDesembolsado: config.monto,
        tasaInteres: config.tasa,
        tipoTasa: "mensual",
        sistemaAmortizacion: "frances",
        tipoCuota: "fija",
        plazoMeses: config.plazo,
        frecuenciaPago: "mensual",
        fechaSolicitud: config.fechaInicio,
        fechaAprobacion: config.fechaInicio,
        fechaDesembolso: config.fechaInicio,
        fechaPrimeraCuota: new Date(new Date(config.fechaInicio).setMonth(config.fechaInicio.getMonth() + 1)),
        totalIntereses: Math.round(totalIntereses * 100) / 100,
        totalAPagar: Math.round(totalAPagar * 100) / 100,
        montoCuota: Math.round(cuotaFija * 100) / 100,
        saldoCapital: config.monto,
        saldoInteres: Math.round(totalIntereses * 100) / 100,
        saldoTotal: Math.round(totalAPagar * 100) / 100,
        estado: config.estado,
        destino: "personal"
      });
      
      await prestamo.save();
      totalPrestamos++;
      
      // Generar cuotas
      const fechaPrimeraCuota = new Date(config.fechaInicio);
      fechaPrimeraCuota.setMonth(fechaPrimeraCuota.getMonth() + 1);
      
      const cuotasData = generarCuotas(prestamo, config.monto, config.tasa, config.plazo, fechaPrimeraCuota);
      
      // Insertar cuotas
      const cuotasInsertadas = await Cuota.insertMany(cuotasData);
      totalCuotas += cuotasInsertadas.length;
      
      // Simular pagos de cuotas
      let capitalPagado = 0;
      let interesPagado = 0;
      
      for (let i = 0; i < config.cuotasPagadas; i++) {
        const cuota = cuotasInsertadas[i];
        
        // Crear pago
        const pago = new Pago({
          financiera: financiera._id,
          prestamo: prestamo._id,
          cuota: cuota._id,
          cliente: config.cliente._id,
          registradoPor: usuarios[1]._id, // María registra los pagos
          monto: cuota.montoCuota,
          distribucion: {
            capital: cuota.capital,
            interes: cuota.interes,
            mora: 0
          },
          tipoPago: "cuota",
          metodoPago: ["efectivo", "transferencia", "deposito"][Math.floor(Math.random() * 3)],
          fechaPago: new Date(cuota.fechaVencimiento.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Pago unos días antes
          estado: "confirmado"
        });
        await pago.save();
        totalPagos++;
        
        // Actualizar cuota
        cuota.montoPagado = cuota.montoCuota;
        cuota.capitalPagado = cuota.capital;
        cuota.interesPagado = cuota.interes;
        cuota.saldoPendiente = 0;
        cuota.estado = "pagada";
        cuota.fechaPago = pago.fechaPago;
        await cuota.save();
        
        capitalPagado += cuota.capital;
        interesPagado += cuota.interes;
      }
      
      // Actualizar saldos del préstamo
      prestamo.totalPagado = Math.round((capitalPagado + interesPagado) * 100) / 100;
      prestamo.capitalPagado = Math.round(capitalPagado * 100) / 100;
      prestamo.interesPagado = Math.round(interesPagado * 100) / 100;
      prestamo.saldoCapital = Math.round((config.monto - capitalPagado) * 100) / 100;
      prestamo.saldoInteres = Math.round((totalIntereses - interesPagado) * 100) / 100;
      prestamo.saldoTotal = prestamo.saldoCapital + prestamo.saldoInteres;
      
      // Calcular fecha última cuota
      const fechaUltima = new Date(fechaPrimeraCuota);
      fechaUltima.setMonth(fechaUltima.getMonth() + config.plazo - 1);
      prestamo.fechaUltimaCuota = fechaUltima;
      
      await prestamo.save();
      
      console.log(`   ✅ ${config.cliente.nombreCompleto}: $${config.monto.toLocaleString()} - ${config.plazo} cuotas (${config.estado})`);
    }
    
    // Marcar cuotas vencidas
    const hoy = new Date();
    await Cuota.updateMany(
      {
        financiera: financiera._id,
        estado: "pendiente",
        fechaVencimiento: { $lt: hoy }
      },
      { estado: "vencida" }
    );
    
    // Resumen final
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN DEL SEED");
    console.log("=".repeat(50));
    console.log(`   🏢 Financiera: ${financiera.nombre}`);
    console.log(`   👥 Usuarios: ${usuarios.length}`);
    console.log(`   👤 Clientes: ${clientes.length}`);
    console.log(`   💰 Préstamos: ${totalPrestamos}`);
    console.log(`   📅 Cuotas: ${totalCuotas}`);
    console.log(`   💵 Pagos: ${totalPagos}`);
    
    console.log("\n" + "=".repeat(50));
    console.log("🔑 CREDENCIALES DE ACCESO");
    console.log("=".repeat(50));
    console.log(`   📧 Admin: admin@creditosdelnorte.com`);
    console.log(`   📧 Empleado: maria@creditosdelnorte.com`);
    console.log(`   📧 Cobrador: juan@creditosdelnorte.com`);
    console.log(`   🔐 Password: ${CONFIG.PASSWORD_DEFAULT}`);
    console.log("\n   Portal Clientes (DNI + password):");
    console.log(`   📧 DNI: 25123456 (Roberto Pérez)`);
    console.log(`   🔐 Password: ${CONFIG.PASSWORD_DEFAULT}`);
    
    console.log("\n✅ Seed completado exitosamente!\n");
    
  } catch (error) {
    console.error("\n❌ Error en seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Desconectado de MongoDB\n");
    process.exit(0);
  }
}

// Ejecutar
seed();