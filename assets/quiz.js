// Five-question quiz: answers → result → email → personalized plan.
// Leads are stored in Supabase (insert-only from the browser).
(function(){
  const box = document.getElementById("quiz-box"); if (!box) return;

  const SUPABASE_URL = "https://urnyakbdeejfxfiafipi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_viSlYXG1P457oDULLn3otg_0rTAAeEj";
  const GUIDE_URL = "/guide.pdf";

  // Order matters: the first flagged problem wins (fastest fix first).
  const ORDER = ["food","protein","training","recovery","time"];

  const T = {
    en: {
      of: "of", yes: "Yes", no: "No", back: "Back",
      emailTitle: "That's it.",
      emailText: "Drop your email and I'll tell you exactly what's going on from your answers, plus the plan: what to do tonight, this week, and from now on.",
      emailPh: "you@email.com", emailBtn: "Show me", emailBad: "That email doesn't look right.",
      resultEyebrow: "Your result", yourProblem: "Your problem is", also: "You also flagged", alsoTail: "The guide covers those too.",
      tonight: "Tonight", week: "This week", forever: "From now on",
      download: "Download the guide", coachLine: "Want this done with you instead of alone?", coachBtn: "See coaching",
      none: "Nothing's flagged.", noneText: "Food, protein, training and sleep are all in place and you've been at it for 12 weeks or more. Either you already look like you train, or the targets are off. That's the one thing a quiz can't check; a coach can.",
      restart: "Answer again",
      q: [
        "Do you know roughly how many calories you ate yesterday?",
        "Do you hit at least 0.8 g of protein per pound of bodyweight most days?",
        "Is most of your weekly exercise cardio, classes or runs instead of lifting?",
        "Do you sleep under 6.5 hours more than twice a week?",
        "Have you been doing this consistently for less than 12 weeks?"
      ],
      // which answer flags the problem
      flag: ["no","no","yes","yes","yes"],
      key: ["food","protein","training","recovery","time"],
      names: {food:"food", protein:"protein", training:"training", recovery:"sleep", time:"time"},
      r: {
        food: {
          why: "You train hard, so you assume the food side takes care of itself. It doesn't. Most people who \"eat pretty clean\" are 300 to 500 calories over without knowing it, and no amount of sessions covers that gap. Nothing is broken; you've just never looked at the number.",
          tonight: "Log everything you ate today, honestly, drinks and the handful of whatever included. Don't change anything yet.",
          week: "Track every day for 7 days and aim for the calorie and protein targets in the guide. Keep your training exactly as it is.",
          forever: "After two weeks, use the Sunday rules in the guide: weight average flat, trim 150 to 200 calories. Dropping slowly and the photos are changing, change nothing."
        },
        protein: {
          why: "Your calories are probably fine, but you're under on protein, so when you lose weight you lose muscle with it and end up smaller, not leaner. Protein is also what keeps you full, which is why the under-eating turns into over-eating by Thursday.",
          tonight: "Work out your number: bodyweight in pounds × 0.8. That's grams per day. Put it on your lock screen.",
          week: "Build every meal around a protein first: eggs and whites, chicken, lean beef, Greek yogurt, whey. Hit the number every day before you worry about anything else.",
          forever: "Once protein is automatic, run the calorie and check-in rules in the guide. Protein never comes down, even on a cut."
        },
        training: {
          why: "Cardio, classes and runs burn a few hundred calories and build nothing. Looking like you train comes from muscle, and muscle comes from lifting progressively heavier three or four days a week. Runs are for your heart and your head. They are not the fat loss plan.",
          tonight: "Pick three days this week you can lift for 45 minutes. Put them in your calendar like meetings.",
          week: "Run the 3-day plan in the guide. Keep the runs if you love them, but after the lifting, not instead of it.",
          forever: "Add weight or reps every week. If the log isn't going up, the mirror won't either. The Sunday check-in tells you when to adjust food around it."
        },
        recovery: {
          why: "Under six and a half hours of sleep, your body holds on to fat, hunger goes up and training goes flat. You can do everything else right and still look soft. Most busy professionals are here and blame the food.",
          tonight: "Set a hard screens-off time 30 minutes before you want to be asleep. Tonight, not Monday.",
          week: "Protect seven hours on four nights out of seven. Keep training to three days this week so recovery can actually happen.",
          forever: "Sleep gets tracked the same way as weight in the check-in. When it slips, that's the first thing you fix before touching calories."
        },
        time: {
          why: "Nothing is wrong. Visible change takes about 12 weeks of the same boring week, and the first three or four usually look worse before they look better. This is exactly where most people change the plan and start over. Don't.",
          tonight: "Take your Day 1 photo. Same spot, same light, every morning from now on.",
          week: "Change nothing. Same food targets, same training days as last week. Boring is the point.",
          forever: "Use the Sunday rules in the guide and only adjust when they say so. Count days, not shortcuts."
        }
      }
    },
    es: {
      of: "de", yes: "Sí", no: "No", back: "Atrás",
      emailTitle: "Eso es todo.",
      emailText: "Deja tu correo y te digo exactamente qué está pasando según tus respuestas, más el plan: qué hacer hoy, esta semana y de aquí en adelante.",
      emailPh: "tu@correo.com", emailBtn: "Ver mi resultado", emailBad: "Ese correo no se ve bien.",
      resultEyebrow: "Tu resultado", yourProblem: "Tu problema es", also: "También marcaste", alsoTail: "La guía también cubre eso.",
      tonight: "Hoy", week: "Esta semana", forever: "De aquí en adelante",
      download: "Descargar la guía", coachLine: "¿Prefieres hacerlo acompañado?", coachBtn: "Ver coaching",
      none: "No se marcó nada.", noneText: "Comida, proteína, entreno y sueño están en su lugar y llevas 12 semanas o más. O ya se nota que entrenas, o las metas están mal. Eso es lo único que un quiz no puede revisar; un coach sí.",
      restart: "Responder de nuevo",
      q: [
        "¿Sabes más o menos cuántas calorías comiste ayer?",
        "¿Llegas a por lo menos 0.8 g de proteína por libra de peso casi todos los días?",
        "¿La mayor parte de tu ejercicio semanal es cardio, clases o correr, en vez de pesas?",
        "¿Duermes menos de 6.5 horas más de dos veces por semana?",
        "¿Llevas menos de 12 semanas haciendo esto de forma constante?"
      ],
      flag: ["no","no","yes","yes","yes"],
      key: ["food","protein","training","recovery","time"],
      names: {food:"la comida", protein:"la proteína", training:"el entreno", recovery:"el sueño", time:"el tiempo"},
      r: {
        food: {
          why: "Entrenas duro, así que asumes que la comida se arregla sola. No es así. La mayoría de los que \"comen bastante bien\" van 300 a 500 calorías arriba sin saberlo, y ninguna cantidad de sesiones cubre ese hueco. Nada está roto; solo nunca has visto el número.",
          tonight: "Registra todo lo que comiste hoy, con honestidad, bebidas y el puñito de lo que sea incluidos. No cambies nada todavía.",
          week: "Registra todos los días por 7 días y apunta a las metas de calorías y proteína de la guía. Deja tu entreno exactamente como está.",
          forever: "Después de dos semanas, usa las reglas del domingo de la guía: promedio de peso plano, recorta 150 a 200 calorías. Bajando despacio y las fotos cambian, no cambies nada."
        },
        protein: {
          why: "Tus calorías probablemente están bien, pero vas corto de proteína, así que cuando bajas de peso pierdes músculo con él y terminas más pequeño, no más definido. La proteína también es lo que te mantiene lleno, por eso comer de menos se vuelve comer de más para el jueves.",
          tonight: "Saca tu número: peso en libras × 0.8. Esos son gramos al día. Ponlo en tu pantalla de bloqueo.",
          week: "Arma cada comida alrededor de una proteína primero: huevos y claras, pollo, res magra, yogur griego, whey. Llega al número todos los días antes de preocuparte por otra cosa.",
          forever: "Cuando la proteína sea automática, corre las reglas de calorías y de revisión de la guía. La proteína nunca baja, ni en definición."
        },
        training: {
          why: "Cardio, clases y correr queman unas cuantas calorías y no construyen nada. Que se note que entrenas viene del músculo, y el músculo viene de levantar cada vez más pesado tres o cuatro días por semana. Correr es para el corazón y la cabeza. No es el plan para bajar grasa.",
          tonight: "Elige tres días de esta semana en los que puedas levantar 45 minutos. Ponlos en tu calendario como juntas.",
          week: "Corre el plan de 3 días de la guía. Sigue corriendo si te encanta, pero después de las pesas, no en lugar de ellas.",
          forever: "Sube peso o repeticiones cada semana. Si el registro no sube, el espejo tampoco. La revisión del domingo te dice cuándo ajustar la comida alrededor."
        },
        recovery: {
          why: "Con menos de seis horas y media de sueño, tu cuerpo se aferra a la grasa, sube el hambre y el entreno se aplana. Puedes hacer todo lo demás bien y seguir viéndote suave. La mayoría de los profesionales ocupados están aquí y le echan la culpa a la comida.",
          tonight: "Pon una hora fija de pantallas apagadas 30 minutos antes de la hora en que quieres estar dormido. Hoy, no el lunes.",
          week: "Protege siete horas cuatro noches de siete. Deja el entreno en tres días esta semana para que la recuperación pueda pasar.",
          forever: "El sueño se registra igual que el peso en la revisión. Cuando se cae, es lo primero que arreglas antes de tocar calorías."
        },
        time: {
          why: "No hay nada mal. El cambio visible toma unas 12 semanas de la misma semana aburrida, y las primeras tres o cuatro normalmente se ven peor antes de verse mejor. Justo aquí es donde la mayoría cambia el plan y vuelve a empezar. No lo hagas.",
          tonight: "Toma tu foto del Día 1. Mismo lugar, misma luz, todas las mañanas de aquí en adelante.",
          week: "No cambies nada. Mismas metas de comida, mismos días de entreno que la semana pasada. Lo aburrido es el punto.",
          forever: "Usa las reglas del domingo de la guía y ajusta solo cuando lo digan. Cuenta días, no atajos."
        }
      }
    }
  };

  let step = 0;            // 0..4 questions, 5 email, 6 result
  const answers = [];      // "yes"/"no"
  let email = "";

  const lang = () => document.body.classList.contains("lang-es") ? "es" : "en";
  const t = () => T[lang()];
  const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  function flagged(){
    const tt = t(); const out = [];
    tt.key.forEach((k,i) => { if (answers[i] === tt.flag[i]) out.push(k); });
    return ORDER.filter(k => out.includes(k));
  }

  function render(){
    const tt = t();
    if (step < 5) {
      box.innerHTML = `
        <div class="qz-prog">${step+1} ${tt.of} 5</div>
        <div class="qz-bar"><span style="width:${(step)/5*100}%"></span></div>
        <div class="qz-step">
          <h3 class="qz-q">${esc(tt.q[step])}</h3>
          <div class="btnrow qz-row">
            <button class="btn primary skew" data-a="yes"><span>${tt.yes}</span></button>
            <button class="btn ghost light skew" data-a="no"><span>${tt.no}</span></button>
          </div>
        </div>
        ${step>0?`<button class="qz-back" data-back>${tt.back}</button>`:""}`;
    } else if (step === 5) {
      box.innerHTML = `
        <div class="qz-prog">5 ${tt.of} 5</div>
        <div class="qz-bar"><span style="width:100%"></span></div>
        <h3 class="qz-q">${tt.emailTitle}</h3>
        <p class="qz-text">${tt.emailText}</p>
        <form class="qz-form" novalidate>
          <input type="email" name="email" placeholder="${tt.emailPh}" autocomplete="email" required value="${esc(email)}">
          <button class="btn primary skew" type="submit"><span>${tt.emailBtn}</span></button>
        </form>
        <div class="qz-err" hidden>${tt.emailBad}</div>
        <button class="qz-back" data-back>${tt.back}</button>`;
      box.querySelector("input").focus();
    } else {
      const f = flagged(); const main = f[0];
      let html = `<div class="eyebrow">${tt.resultEyebrow}</div>`;
      if (!main) {
        html += `<h3 class="qz-q">${tt.none}</h3><p class="qz-text">${tt.noneText}</p>`;
      } else {
        const r = tt.r[main];
        html += `<h3 class="qz-q">${tt.yourProblem} <span class="qz-hi">${tt.names[main]}</span>.</h3>
          <p class="qz-text">${r.why}</p>
          ${f.length>1?`<p class="qz-also">${tt.also}: ${f.slice(1).map(k=>tt.names[k]).join(", ")}. ${tt.alsoTail}</p>`:""}
          <div class="qz-plan">
            <div><div class="qz-k">${tt.tonight}</div><p>${r.tonight}</p></div>
            <div><div class="qz-k">${tt.week}</div><p>${r.week}</p></div>
            <div><div class="qz-k">${tt.forever}</div><p>${r.forever}</p></div>
          </div>`;
      }
      html += `<div class="btnrow qz-row">
          <a class="btn primary skew" href="${GUIDE_URL}" target="_blank" rel="noopener"><span>${tt.download}</span></a>
        </div>
        <p class="qz-text qz-coach">${tt.coachLine} <a href="/coaching">${tt.coachBtn}</a></p>
        <button class="qz-back" data-back="restart">${tt.restart}</button>`;
      box.innerHTML = html;
    }
  }

  function save(){
    const f = flagged();
    const body = { email, answers: { q: answers, flagged: f }, result: f[0] || "none", lang: lang(), source: location.pathname };
    return fetch(`${SUPABASE_URL}/rest/v1/quiz_leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=minimal" },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(() => {});
  }

  box.addEventListener("click", e => {
    const a = e.target.closest("[data-a]");
    if (a) { answers[step] = a.dataset.a; step++; render(); return; }
    const b = e.target.closest("[data-back]");
    if (b) { if (b.dataset.back === "restart") { step = 0; answers.length = 0; } else { step--; } render(); }
  });
  box.addEventListener("submit", e => {
    e.preventDefault();
    const inp = box.querySelector("input[name=email]");
    email = (inp.value || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { box.querySelector(".qz-err").hidden = false; inp.focus(); return; }
    save();
    step = 6; render();
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  // re-render when the language toggles
  document.querySelectorAll(".langbtn").forEach(b => b.addEventListener("click", () => setTimeout(render, 0)));

  render();
})();
