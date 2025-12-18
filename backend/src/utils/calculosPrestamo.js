// src/utils/calculosPrestamo.js

/**
 * Calcula las cuotas usando el Sistema Francés (cuota fija)
 * @param {number} capital - Monto del préstamo
 * @param {number} tasaInteres - Tasa de interés
 * @param {string} tipoTasa - "mensual" o "anual"
 * @param {number} plazoMeses - Cantidad de cuotas
 * @param {Date} fechaPrimeraCuota - Fecha de la primera cuota
 * @param {string} frecuencia - "semanal", "quincenal", "mensual"
 * @returns {Object} - Información del préstamo y array de cuotas
 */
export function calcularSistemaFrances(capital, tasaInteres, tipoTasa, plazoMeses, fechaPrimeraCuota, frecuencia = "mensual") {
  // Convertir tasa a la frecuencia correspondiente
  let tasaPeriodo;
  if (tipoTasa === "anual") {
    switch (frecuencia) {
      case "semanal":
        tasaPeriodo = tasaInteres / 100 / 52;
        break;
      case "quincenal":
        tasaPeriodo = tasaInteres / 100 / 24;
        break;
      default: // mensual
        tasaPeriodo = tasaInteres / 100 / 12;
    }
  } else {
    // Tasa mensual, ajustar según frecuencia
    switch (frecuencia) {
      case "semanal":
        tasaPeriodo = tasaInteres / 100 / 4;
        break;
      case "quincenal":
        tasaPeriodo = tasaInteres / 100 / 2;
        break;
      default:
        tasaPeriodo = tasaInteres / 100;
    }
  }
  
  const n = plazoMeses;
  
  // Fórmula sistema francés: C = P * [r(1+r)^n] / [(1+r)^n - 1]
  const cuotaFija = capital * (tasaPeriodo * Math.pow(1 + tasaPeriodo, n)) / (Math.pow(1 + tasaPeriodo, n) - 1);
  
  let saldo = capital;
  let totalIntereses = 0;
  const cuotas = [];
  let fechaCuota = new Date(fechaPrimeraCuota);
  
  for (let i = 1; i <= n; i++) {
    const interes = saldo * tasaPeriodo;
    const amortizacion = cuotaFija - interes;
    saldo -= amortizacion;
    totalIntereses += interes;
    
    cuotas.push({
      numeroCuota: i,
      fechaVencimiento: new Date(fechaCuota),
      montoCuota: redondear(cuotaFija),
      capital: redondear(amortizacion),
      interes: redondear(interes),
      saldoRestante: redondear(Math.max(saldo, 0))
    });
    
    // Calcular próxima fecha según frecuencia
    fechaCuota = calcularSiguienteFecha(fechaCuota, frecuencia);
  }
  
  return {
    sistema: "frances",
    capital,
    tasaInteres,
    tipoTasa,
    plazoMeses,
    frecuencia,
    montoCuota: redondear(cuotaFija),
    totalIntereses: redondear(totalIntereses),
    totalAPagar: redondear(capital + totalIntereses),
    cuotas
  };
}

/**
 * Calcula las cuotas usando el Sistema Alemán (amortización fija)
 * @param {number} capital - Monto del préstamo
 * @param {number} tasaInteres - Tasa de interés
 * @param {string} tipoTasa - "mensual" o "anual"
 * @param {number} plazoMeses - Cantidad de cuotas
 * @param {Date} fechaPrimeraCuota - Fecha de la primera cuota
 * @param {string} frecuencia - "semanal", "quincenal", "mensual"
 * @returns {Object} - Información del préstamo y array de cuotas
 */
export function calcularSistemaAleman(capital, tasaInteres, tipoTasa, plazoMeses, fechaPrimeraCuota, frecuencia = "mensual") {
  // Convertir tasa a la frecuencia correspondiente
  let tasaPeriodo;
  if (tipoTasa === "anual") {
    switch (frecuencia) {
      case "semanal":
        tasaPeriodo = tasaInteres / 100 / 52;
        break;
      case "quincenal":
        tasaPeriodo = tasaInteres / 100 / 24;
        break;
      default:
        tasaPeriodo = tasaInteres / 100 / 12;
    }
  } else {
    switch (frecuencia) {
      case "semanal":
        tasaPeriodo = tasaInteres / 100 / 4;
        break;
      case "quincenal":
        tasaPeriodo = tasaInteres / 100 / 2;
        break;
      default:
        tasaPeriodo = tasaInteres / 100;
    }
  }
  
  const n = plazoMeses;
  const amortizacionFija = capital / n;
  
  let saldo = capital;
  let totalIntereses = 0;
  const cuotas = [];
  let fechaCuota = new Date(fechaPrimeraCuota);
  
  for (let i = 1; i <= n; i++) {
    const interes = saldo * tasaPeriodo;
    const cuota = amortizacionFija + interes;
    saldo -= amortizacionFija;
    totalIntereses += interes;
    
    cuotas.push({
      numeroCuota: i,
      fechaVencimiento: new Date(fechaCuota),
      montoCuota: redondear(cuota),
      capital: redondear(amortizacionFija),
      interes: redondear(interes),
      saldoRestante: redondear(Math.max(saldo, 0))
    });
    
    fechaCuota = calcularSiguienteFecha(fechaCuota, frecuencia);
  }
  
  return {
    sistema: "aleman",
    capital,
    tasaInteres,
    tipoTasa,
    plazoMeses,
    frecuencia,
    montoCuotaInicial: redondear(cuotas[0].montoCuota),
    montoCuotaFinal: redondear(cuotas[cuotas.length - 1].montoCuota),
    totalIntereses: redondear(totalIntereses),
    totalAPagar: redondear(capital + totalIntereses),
    cuotas
  };
}

/**
 * Calcula el monto de cancelación anticipada
 * @param {number} saldoCapital - Capital pendiente
 * @param {number} saldoInteres - Intereses pendientes
 * @param {number} saldoMora - Mora pendiente
 * @param {Date} fechaUltimaCuota - Fecha de la última cuota
 * @param {number} descuentoPorDia - % de descuento por día anticipado
 * @returns {Object} - Detalle de la cancelación
 */
export function calcularCancelacionAnticipada(saldoCapital, saldoInteres, saldoMora, fechaUltimaCuota, descuentoPorDia) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const ultimaCuota = new Date(fechaUltimaCuota);
  ultimaCuota.setHours(0, 0, 0, 0);
  
  const diasRestantes = Math.ceil((ultimaCuota - hoy) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes <= 0) {
    return {
      permitido: false,
      mensaje: "El préstamo ya venció o vence hoy"
    };
  }
  
  // Calcular descuento sobre intereses pendientes
  const descuento = saldoInteres * (descuentoPorDia / 100) * diasRestantes;
  const interesesConDescuento = Math.max(saldoInteres - descuento, 0);
  
  // El monto mínimo a pagar es el capital + mora
  const montoFinal = saldoCapital + interesesConDescuento + saldoMora;
  
  return {
    permitido: true,
    fechaCalculo: hoy,
    diasRestantes,
    saldoCapital: redondear(saldoCapital),
    saldoInteres: redondear(saldoInteres),
    saldoMora: redondear(saldoMora),
    descuento: redondear(descuento),
    interesesConDescuento: redondear(interesesConDescuento),
    montoFinal: redondear(montoFinal),
    ahorro: redondear(descuento)
  };
}

/**
 * Calcula la mora por días de atraso
 * @param {number} montoPendiente - Monto pendiente de la cuota
 * @param {Date} fechaVencimiento - Fecha de vencimiento de la cuota
 * @param {number} porcentajeDiario - % de mora diaria
 * @param {number} diasGracia - Días de gracia antes de aplicar mora
 * @returns {Object} - Detalle de la mora
 */
export function calcularMora(montoPendiente, fechaVencimiento, porcentajeDiario, diasGracia = 0) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  
  const diasAtraso = Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24));
  
  if (diasAtraso <= 0) {
    return {
      diasAtraso: 0,
      diasEfectivos: 0,
      mora: 0,
      totalConMora: montoPendiente
    };
  }
  
  const diasEfectivos = Math.max(diasAtraso - diasGracia, 0);
  const mora = montoPendiente * (porcentajeDiario / 100) * diasEfectivos;
  
  return {
    diasAtraso,
    diasGracia,
    diasEfectivos,
    porcentajeDiario,
    mora: redondear(mora),
    totalConMora: redondear(montoPendiente + mora)
  };
}

/**
 * Simula un préstamo (para mostrar al cliente antes de confirmar)
 * @param {Object} params - Parámetros del préstamo
 * @returns {Object} - Simulación completa
 */
export function simularPrestamo({ capital, tasaInteres, tipoTasa, plazoMeses, sistema, frecuencia, fechaPrimeraCuota }) {
  const fecha = fechaPrimeraCuota || new Date();
  
  if (sistema === "aleman") {
    return calcularSistemaAleman(capital, tasaInteres, tipoTasa, plazoMeses, fecha, frecuencia);
  }
  
  return calcularSistemaFrances(capital, tasaInteres, tipoTasa, plazoMeses, fecha, frecuencia);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Redondea a 2 decimales
 */
function redondear(numero) {
  return Math.round(numero * 100) / 100;
}

/**
 * Calcula la siguiente fecha según la frecuencia
 */
function calcularSiguienteFecha(fecha, frecuencia) {
  const nueva = new Date(fecha);
  
  switch (frecuencia) {
    case "semanal":
      nueva.setDate(nueva.getDate() + 7);
      break;
    case "quincenal":
      nueva.setDate(nueva.getDate() + 15);
      break;
    default: // mensual
      nueva.setMonth(nueva.getMonth() + 1);
  }
  
  return nueva;
}

/**
 * Calcula la última fecha de cuota
 */
export function calcularFechaUltimaCuota(fechaPrimera, plazoMeses, frecuencia) {
  let fecha = new Date(fechaPrimera);
  
  for (let i = 1; i < plazoMeses; i++) {
    fecha = calcularSiguienteFecha(fecha, frecuencia);
  }
  
  return fecha;
}
