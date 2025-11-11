'use client';

import Threads from '../../components/Threads';

export default function MemoPage() {
  return (
    <main className="memo-page min-h-screen flex overflow-hidden bg-black text-white">
      {/* Left Sidebar - Threads Animation (hidden on mobile) */}
      <div className="w-third h-screen relative hide-on-mobile bg-black">
        <Threads
          color={[1, 1, 1]}
          amplitude={2}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>
      
      {/* Right Side - Content */}
      <div className="w-two-thirds w-full-mobile h-screen overflow-y-auto px-6 py-4 bg-black">
        <div className="max-w-3xl text-white mt-250">
          <div className="memo-logo-container">
            <h1 className="memo-logo font-brand">TheNetwork</h1>
          </div>
          {/* Top Spacing */}
          <div style={{height: '160px'}}></div>
          
          {/* Large Spacing */}
          <div style={{height: '410px'}}></div>

          {/* Our Thesis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Thesis</h2>
              <div className="space-y-4 text-base leading-normal text-gray-200 font-ui">
                <p>
                  Most AI today feels <span className="accent-text font-semibold">generic and disconnected</span> because it doesn't start with a real understanding of who you are. Instead, it depends on surface-level or self-reported data from platforms like <span className="accent-text font-semibold">LinkedIn or Instagram</span>, missing the depth of how people actually behave and express themselves.
                </p>
                <p>
                  We begin with <span className="accent-text font-semibold">YouTube and TikTok</span>, the two richest behavioral ecosystems on the planet, allowing people to pick up from where they already are rather than starting from zero. By helping users seamlessly export the foundation of their social graph into our apps, we unlock a living picture of their interests, rhythms, and emotions.
                </p>
                <p>
                  <span className="accent-text font-semibold">YouTube and TikTok are scaffolding, not strategy</span>: we import behavioral signals as a starting layer, but true personalization cannot depend on external graphs—it must compound through lived behavior, feedback, and ethically user-owned memory.
                </p>
                <p>
                  From there we work on the frontier of <span className="accent-text font-semibold">AI memory</span>, designing systems that create the "this app gets me" feeling, the real aha moment. Our mission is to deliver <span className="accent-text font-semibold">true personalization at scale</span>, building technology that remembers you and evolves with you over time.
                </p>
                <p>
                  We believe the next suite of consumer apps and social interfaces will not exist as isolated products but as <span className="accent-text font-semibold">connected experiences</span> that understand, remember, and adapt together, forming an ecosystem that truly reflects the people who use it.
                </p>
              </div>
          </section>

          {/* Building the ScaleAI */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Building the ScaleAI for Human Personalization</h2>
            <div className="space-y-4 text-base leading-normal text-gray-200 font-ui">
              <p>
                Imagine a world where AI understands you better than your closest friends, without you ever saying a word. Today, AI systems are limited because they rely on shallow, surface-level data such as your LinkedIn bio, your Instagram follows, or a survey you quickly filled out. But these systems miss the <span className="accent-text font-semibold">deep psychological patterns</span> hidden in the everyday behaviors you've unknowingly shaped through platforms like <span className="accent-text font-semibold">TikTok and YouTube</span>.
              </p>
              <p>
                Over the past decade, you've unintentionally constructed a <span className="accent-text font-semibold">rich Skinner box</span>, a complex map of preferences and behaviors that these platforms meticulously track yet remains untapped for true AI personalization. These algorithms weren't built with modern AI in mind, but they've accidentally captured the most detailed snapshot of human behavior ever recorded.
              </p>
              <p>
                Our team's background in <span className="accent-text font-semibold">neuroscience, cognitive science, and a deep taste for consumer technology</span> gives us a unique lens to translate these behavioral signals into systems that actually understand people. We believe the missing layer in AI is not intelligence, it's <span className="accent-text font-semibold">memory</span>. Memory is what makes intelligence feel human. It's what transforms an interaction from mechanical to meaningful.
              </p>
              <p>
                You could be the most charismatic, smart, funny, and attractive person in the world, but if you don't remember anything about me, I won't feel seen. That's exactly the problem current AI systems face. They can be witty, articulate, and efficient, yet they lack continuity because they don't remember who you are, what you like, or how you felt yesterday.
              </p>
              <div className="bg-white/5 border-l-4 border-white/20 p-4 rounded-r-lg my-6">
                <p className="text-gray-200 italic">"I don't want to switch off of GPT because it knows a lot about me."</p>
                <p className="text-gray-400 text-sm mt-2">(Based on informal interviews conducted with 200+ students across college campuses who chose to stay with ChatGPT despite having free Gemini Pro access.)</p>
              </div>
              <p>
                At our company, we see memory as the true driver of personalization and <span className="accent-text font-semibold">proactivity as its natural evolution</span>. Once AI can remember, it can begin to anticipate, surfacing the right ideas, connections, and actions before you even ask. By building on the behavioral foundations of platforms like TikTok and YouTube, we're creating AI systems that don't just respond, they remember and act. They adapt, recall, and evolve with you over time, unlocking a new era of truly personal and proactive technology that feels less like a tool and more like a <span className="accent-text font-semibold">companion that genuinely understands and supports you</span>.
              </p>
            </div>
          </section>

          {/* Our Strategy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Strategy</h2>
            <div className="space-y-4 text-base leading-normal text-gray-200 font-ui">
              <p>
                We have been quietly building an <span className="accent-text font-semibold">Applied AI Consumer Lab</span>, a company experimenting at the frontier of memory, proactivity, and human-AI interaction. Our mission is to design systems that understand people deeply, anticipate their needs, and enhance their daily lives. We are not building another consumer app. We are building the foundation for a new class of intelligent, personalized interfaces that integrate seamlessly into how people live, connect, and express themselves.
              </p>
              <p className="accent-text font-semibold">
                Memory is the final product. Every app and interaction compounds into a longitudinal understanding that gets better over time.
              </p>
              <p>
                Our focus is on <span className="accent-text font-semibold">AI memory and proactive agents</span>, systems that don't just respond but act. We are exploring how AI can become a daily collaborator, helping people across multiple dimensions of life:
              </p>
              <ul className="ml-4 space-y-3 list-disc pl-6">
                <li>
                  <span className="accent-text font-semibold">Social connection:</span> Helping people meet new friends and reconnect with old ones through shared behaviors and emotional alignment.
                </li>
                <li>
                  <span className="accent-text font-semibold">Health and wellness:</span> Using memory and behavioral insights to monitor patterns and support well-being, similar to how Flo personalizes health cycles.
                </li>
                <li>
                  <span className="accent-text font-semibold">Fashion and self-expression:</span> Translating behavioral and visual cues from platforms like TikTok and YouTube into a dynamic reflection of personal style.
                </li>
                <li>
                  <span className="accent-text font-semibold">Everyday utility:</span> Creating proactive agents that anticipate needs, remind, suggest, and assist before a user even has to ask.
                </li>
              </ul>
              <p>
                Over the past few months, we have been testing these ideas in the real world. We have built and launched more than <span className="accent-text font-semibold">ten consumer AI apps</span>, failed fast on several, and scaled others to over <span className="accent-text font-semibold">4,000 active users combined</span>. Each experiment has taught us something new about true consumer intent—what people actually want when AI becomes part of their lives.
              </p>
              <p>
                We have already begun validating our approach with data that works. In our first pilot with 20 users, <span className="accent-text font-semibold">80 percent were matched with their actual best friends</span> using embeddings generated by OpenAI and Gemini's base models, with <span className="accent-text font-semibold">no fine-tuning</span>. That level of accuracy from a simple test shows that the data The Network collects captures <span className="accent-text font-semibold">real social semantics</span>. If this performance is possible without training, a fine-tuned, domain-specific model trained on The Network's longitudinal, <span className="accent-text font-semibold">consent-based data</span> could generate enormous personalization value across social, wellbeing, and cognitive applications. The insight is simple: our data makes sense socially, mathematically, and emotionally, and we have <span className="accent-text font-semibold">earned the trust</span> that allows us to collect it in the first place. That is the foundation of everything we are building.
              </p>
              <p>
                Now, we are channeling those learnings into a unified system: a <span className="accent-text font-semibold">memory and personalization engine</span> that powers proactive AI agents across verticals. Each new app we launch strengthens the memory layer, creating an interconnected ecosystem of experiences that learns collectively and adapts over time.
              </p>
              <p>
                Our next step is to scale the lab by expanding our team, deepening research partnerships, and building long-term infrastructure around <span className="accent-text font-semibold">behavioral data, memory graphs, and lightweight on-device models</span>. As this foundation grows, it evolves into a personal intelligence layer that moves with the user across every part of their digital and physical life.
              </p>
              <p>
                We believe the next generation of consumer AI will not be defined by a single product. It will be a <span className="accent-text font-semibold">connected network of proactive, memory-powered experiences</span> that understand, remember, and grow with people. We have been quietly building the lab to make that future real.
              </p>
            </div>
            <div className="mt-8 mb-8">
              <div className="relative">
                <div className="absolute left-0 top-1/2 w-16 h-px bg-white/30 transform -translate-y-1/2"></div>
                <div className="pl-24">
                  <p className="text-4xl md:text-5xl lg:text-6xl font-brand text-white leading-tight" style={{fontWeight: 400}}>
                    Bill Gates once said he wants everyone to have their own PC running Windows.
                  </p>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-brand text-white leading-tight mt-4" style={{fontWeight: 400}}>
                    We want everyone to get their own Jarvis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Graphical Representations Note */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Just some graphical representations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-center">
                <h3 className="font-bold text-gray-200 mb-3 text-base">What AI is currently built on:</h3>
                <div className="border border-white/15 rounded-lg p-2 bg-white/5">
                  <img 
                    src="/2dgraph.png" 
                    alt="2D representation of current AI data - surface-level data, surveys, and shallow behavioral indicators"
                    className="w-full h-auto rounded"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">2D surface-level data, surveys, and shallow behavioral indicators</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-200 mb-3 text-base">What we're building:</h3>
                <div className="border border-white/15 rounded-lg p-2 bg-white/5">
                  <img 
                    src="/3dgraph.png" 
                    alt="3D representation of future AI data - deep behavioral data layer with subconscious pattern recognition"
                    className="w-full h-auto rounded"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">3D deep behavioral data layer with subconscious pattern recognition</p>
              </div>
            </div>
          </section>


          {/* Why The Network Wins */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Why The Network Wins</h2>
            <div className="space-y-4 text-base leading-normal text-gray-200 font-ui">
              <p>
                We are entering a new era of human AI interaction. The world doesn't need another app that does one thing, it needs a <span className="accent-text font-semibold">connected system that understands people across everything they do</span>.
              </p>
              <p>
                Social networks used to be destinations. You went to Facebook to connect, to Instagram to share, to TikTok to express. But the next generation of platforms will not live in a single app. They will <span className="accent-text font-semibold">live with the user, across time, memory, and context</span>.
              </p>
              <p>
                The Network wins because we are building exactly that, the missing behavioral data and memory infrastructure that allows AI to truly personalize human experience. Our system will benefit from the existing social graphs that users have already created through YouTube and TikTok. Over time, we will own a <span className="accent-text font-semibold">social graph that is completely unique</span>, built from authentic behavior and interaction. After hundreds of conversations with users, friends, and classmates, our insight is clear: this graph should not live inside a single app, it should <span className="accent-text font-semibold">live across our entire ecosystem</span>. Every new experience we launch will be aware of that graph, creating a connected layer of personalization that grows stronger with every interaction.
              </p>
              <p>
                Our long-term advantage is <span className="accent-text font-semibold">continuity</span>: a persistent, user-owned memory graph that integrates behavioral signals, contextual cues, and human feedback. This turns personalization into <span className="accent-text font-semibold">infrastructure</span>—not a feature—spanning social, wellness, style, and productivity.
              </p>
              <p>
                There are strong cultural tailwinds behind this shift. Gen Z is done with mindless scrolling. Despite social apps being more addictive than ever, engagement among younger audiences is actually declining. What people want now is real connection, authenticity, belonging, and tools that understand them without demanding attention.
              </p>
              <p>
                The truth is that every major social platform today is <span className="accent-text font-semibold">trapped by its own business model</span>. Facebook, Instagram, and TikTok cannot fix the loneliness they helped create because their revenue depends on keeping people online, not connected. Their incentive is <span className="accent-text font-semibold">engagement, not empathy</span>. The longer users scroll, the more ads they serve. That loop makes it impossible for them to build technology that pushes people to form real friendships or spend time offline. It's similar to the Industrial Revolution: an era that drove human progress but also left pollution and inequality in its wake. Every technological revolution creates externalities that its inventors fail to address. The <span className="accent-text font-semibold">digital revolution's externality is isolation</span>. The Network exists to solve that. We are building a system where the <span className="accent-text font-semibold">business model aligns with human wellbeing</span>, where success means that <span className="accent-text font-semibold">people log off together, not scroll alone</span>. By designing around trust and belonging rather than attention and ads, we're correcting the course of what social technology was supposed to be in the first place.
              </p>
              <p>
                I was describing The Network to a friend recently, and they asked a fair question: "How are you different from Meta? They already have Facebook, Instagram, and WhatsApp. Why couldn't they build this?" The answer is <span className="accent-text font-semibold">trust and intent</span>. Meta, Google, and OpenAI all have distribution, but none of them have the <span className="accent-text font-semibold">cultural credibility</span> to enter the emotional or social-health layer of AI. Their models are designed to optimize for engagement, advertising, or enterprise efficiency, not for human connection. The Edelman Trust Barometer reports that only 18 percent of Gen Z users trust Meta to handle their data responsibly, while more than 70 percent associate Meta products with manipulation, misinformation, or anxiety. Pew Research found that 64 percent of Americans would not want Meta to manage AI systems that touch mental health or relationships. In similar studies, only 28 percent of users say they trust Google with personal data, and OpenAI's brand trust index has fallen by 21 points since March 2024 after concerns around memory and privacy surfaced. <span className="accent-text font-semibold">Trust is the only user experience differentiator that you cannot buy, and once it is lost, it cannot be recovered</span>. This is why Meta will always be a creator platform, Google will always be a search platform, and OpenAI will remain an intelligence layer. None of them can credibly become a personal intelligence layer because <span className="accent-text font-semibold">people do not trust their intent</span>.
              </p>
              <p>
                The first wave of AI social apps like Sora2 proved this tension. They gained instant hype but no retention. People don't want synthetic feeds; they want systems that make their real lives richer.
              </p>
              <p>
                The Network sits exactly at that intersection. We believe AI will stay, but its role is changing. AI should not replace people, it should remember, connect, and empower them. We see a world of <span className="accent-text font-semibold">agent to agent collaboration</span>, where every user has their own Jarvis, not a single omnipotent assistant, but a network of smaller, specialized agents that act together, coordinate, and get things done for you.
              </p>
              <p>
                That is the infrastructure we are building, a <span className="accent-text font-semibold">human centered layer of memory, intelligence, and coordination</span> that bridges people and AI. It is not just another social product; it is the operating system for the next generation of digital life.
              </p>
            </div>
          </section>

          {/* Our First Product Button to be added later
          <div className="my-20 text-center">
            <a 
              href="/phtogrph" 
              className="text-xl font-semibold text-white hover:text-orange-200 transition-colors duration-300 border-b-2 border-white hover:border-orange-200 pb-1"
            >
              Our First Product
            </a>
          </div> */}

          {/* Footer */}
          <footer className="site-footer mt-16">
            <a href="/privacy">Privacy</a>
            <span> · </span>
            <a href="/terms">Terms</a>
          </footer>
        </div>
      </div>
    </main>
  );
}
