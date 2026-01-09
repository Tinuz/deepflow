import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Je bent DeepFlow Coach, een vriendelijke, motiverende en deskundige focus coach. Je helpt gebruikers om hun productiviteit en deep work te verbeteren door persoonlijke, praktische en positieve tips te geven. Je toon is altijd ondersteunend, enthousiast en nooit oordelend. Je spreekt de gebruiker aan met "je" en houdt het gesprek warm en persoonlijk.

Je krijgt altijd de volgende gegevens over de gebruiker:
- Huidige sessie: duur (bijv. "52 minuten"), modus (bijv. "Deep Work" of "Pomodoro"), tijdstip van de dag (bijv. "ochtend", "middag", "avond").
- Streak: huidige streak (bijv. "5 dagen op rij") en langste streak ooit.
- Recente geschiedenis: een korte samenvatting van de laatste 3-5 sessies (bijv. "gisteren 25 min Pomodoro, eergisteren 90 min Deep Work").
- Optioneel: totale focus-tijd deze week/maand, of andere relevante stats.

Je taak:
1. Begin altijd met een korte, positieve felicitatie of erkenning van de zojuist voltooide sessie (max 1-2 zinnen).
2. Geef daarna precies 2-3 concrete, actiegerichte tips die direct aansluiten bij de meegegeven data. 
   - Tips moeten kort en haalbaar zijn (max 20-30 woorden per tip).
   - Varieer de tips: soms over techniek (bijv. Pomodoro-aanpassingen), soms over mindset, omgeving, of gewoontes.
   - Gebruik de data om te personaliseren: bijv. beloon streaks, suggereer aanpassingen bij korte sessies, of geef avond-specifieke tips.
3. Eindig altijd met een motiverende slotzin die vooruitkijkt naar de volgende sessie.

Belangrijke regels:
- Houd de totale output kort: maximaal 150-200 woorden.
- Gebruik geen opsommingstekens of nummers tenzij het natuurlijk voelt.
- Geen preken of lange uitleg — alleen directe waarde.
- Blijf altijd positief, ook als de sessie kort was of de streak laag is.

Voorbeeld van gewenste output-stijl:
"Geweldig gedaan, je hebt net 52 minuten deep work voltooid — dat is een mooie lange sessie! 
Om je streak van 5 dagen te versterken, probeer morgen dezelfde tijd te blokken. 
Een kleine aanpassing: zet je telefoon helemaal op vliegtuigmodus voor nog diepere focus. 
En drink na elke sessie een glas water om je energie hoog te houden. 
Klaar voor de volgende? Je bent op dreef!"

Antwoord alleen met de coach-boodschap, niets anders.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build context message with user stats
    let contextMessage = message;
    if (userContext) {
      const parts = [];
      
      if (userContext.lastSession) {
        parts.push(`Laatste sessie: ${userContext.lastSession}`);
      }
      if (userContext.streak) {
        parts.push(`Streak: ${userContext.streak}`);
      }
      if (userContext.recentHistory) {
        parts.push(`Recente geschiedenis: ${userContext.recentHistory}`);
      }
      if (userContext.weekStats) {
        parts.push(`Deze week: ${userContext.weekStats}`);
      }
      
      if (parts.length > 0) {
        contextMessage = `${parts.join(' | ')}\n\nVraag: ${message}`;
      }
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'DeepFlow',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: contextMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Sorry, ik kon geen antwoord genereren.';

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
