/* Motor de predicción y optimización en JavaScript.
   Reproduce exactamente los modelos de scikit-learn exportados en modelos.json:
   - preprocesamiento: One-Hot (categóricas) + StandardScaler (numéricas)
   - Random Forest: promedio de la probabilidad de cada árbol
   - AdaBoost (SAMME, binario): p = 1 / (1 + exp(-d)),  d = Σ w_i·(±2) / Σ w_i
   - Random Forest Regressor: promedio de los árboles
   - Optimizador de presupuesto: greedy por beneficio marginal con tope de 3x lo histórico */
(function (g) {
  function vector(pre, x) {
    const v = [];
    pre.cat.forEach((c, i) => pre.categorias[i].forEach(k => v.push(String(x[c]) === k ? 1 : 0)));
    pre.num.forEach((c, i) => v.push((x[c] - pre.media[i]) / pre.escala[i]));
    return v;
  }
  function hoja(a, v) {
    let n = 0;
    while (a.l[n] !== -1) n = v[a.f[n]] <= a.t[n] ? a.l[n] : a.r[n];
    return a.v[n];
  }
  function construirFila(p) {
    const impr = Math.max(+p.impresiones || 1, 1), clics = Math.max(+p.clics || 0, 0), gasto = Math.max(+p.gasto || 0, 0);
    return {
      xyz_campaign_id: String(p.campana), age: p.edad, gender: p.genero, interest: String(p.interes),
      log_impresiones: Math.log1p(impr), Clicks: clics, log_gasto: Math.log1p(gasto),
      CTR: clics / impr * 100, CPC: clics > 0 ? gasto / clics : 0, CPM: gasto / impr * 1000, _gasto: gasto
    };
  }
  function probRF(M, x) {
    const v = vector(M.rf.pre, x);
    return M.rf.arboles.reduce((s, a) => s + hoja(a, v), 0) / M.rf.arboles.length;
  }
  function probAda(M, x) {
    const v = vector(M.ada.pre, x); let d = 0, W = 0;
    M.ada.arboles.forEach((a, i) => { const w = M.ada.pesos[i]; d += w * (hoja(a, v) === 1 ? 2 : -2); W += w; });
    return 1 / (1 + Math.exp(-d / W));
  }
  function ventasReg(M, x) {
    const v = vector(M.reg.pre, x);
    return M.reg.arboles.reduce((s, a) => s + hoja(a, v), 0) / M.reg.arboles.length;
  }
  function predecir(M, p, valor) {
    const x = construirFila(p), gasto = x._gasto;
    const prob_rf = probRF(M, x), prob_ada = probAda(M, x), prob = (prob_rf + prob_ada) / 2;
    const conv = Math.max(ventasReg(M, x), 0), ingreso = conv * valor;
    const roi = gasto > 0 ? (ingreso - gasto) / gasto : null;
    let reco;
    if (prob >= 0.6 && (roi === null || roi > 0)) reco = "🟢 ESCALAR: alta probabilidad de venta y ROI positivo. Aumente la inversión de forma gradual (+20%).";
    else if (prob >= 0.4) reco = "🟡 OPTIMIZAR: probabilidad media. Pruebe nuevas creatividades o intereses con un A/B test antes de escalar.";
    else reco = "🔴 REASIGNAR: baja probabilidad de venta. Mueva este presupuesto a segmentos con mejor ROI.";
    return { prob_rf, prob_adaboost: prob_ada, prob_ensamble: prob, conv_esperadas: conv, ingreso_esperado: ingreso,
             roi_esperado: roi, cpa_esperado: conv > 0 ? gasto / conv : null, recomendacion: reco };
  }
  function optimizar(seg, b, presupuesto, valor, soloRentable, tope = 3) {
    const nombres = Object.keys(seg), total = nombres.reduce((s, n) => s + seg[n].gasto_hist, 0);
    const conv = (n, B) => B > 0 ? seg[n].k * seg[n].anuncios * Math.pow(B / seg[n].anuncios, b) : 0;
    const asign = {}, limite = {}; nombres.forEach(n => { asign[n] = 0; limite[n] = tope * presupuesto * seg[n].gasto_hist / total; });
    const paso = presupuesto / 400; let restante = presupuesto;
    while (restante > 1e-9) {
      const inc = Math.min(paso, restante);
      const disp = nombres.filter(n => asign[n] + inc <= limite[n] + 1e-9);
      if (!disp.length) break;
      let mejor = disp[0], mg = -Infinity;
      disp.forEach(n => { const g_ = conv(n, asign[n] + inc) - conv(n, asign[n]); if (g_ > mg) { mg = g_; mejor = n; } });
      if (soloRentable && mg * valor < inc) break;
      asign[mejor] += inc; restante -= inc;
    }
    let inv = 0, co = 0, base = 0;
    const filas = nombres.map(n => {
      const prop = presupuesto * seg[n].gasto_hist / total; inv += asign[n]; co += conv(n, asign[n]); base += conv(n, prop);
      return { segmento: n, campana: seg[n].campana, edad: seg[n].edad, genero: seg[n].genero, inversion: asign[n],
               inversion_historica_prop: prop, conv_esperadas: conv(n, asign[n]) };
    }).sort((a, c) => c.inversion - a.inversion);
    return { asignacion: filas, inversion: inv, conv_optimas: co, conv_base: base,
             roi_optimo: inv ? (co * valor - inv) / inv : null, roi_base: (base * valor - presupuesto) / presupuesto,
             "mejora_%": base ? (co / base - 1) * 100 : null };
  }
  g.Motor = { predecir, optimizar, probRF, probAda, ventasReg, construirFila };
  if (typeof module !== "undefined") module.exports = g.Motor;
})(typeof window !== "undefined" ? window : globalThis);
