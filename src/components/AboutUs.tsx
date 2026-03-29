import {
  Cpu,
  Shield,
  Mic,
  Globe,
  HeartPulse,
  MessageSquare,
  Zap,
  Radio
} from "lucide-react";

import { motion, Variants } from "framer-motion";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], 
    },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardHover =
  "transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(251,191,36,0.15)] hover:border-amber-400/30 hover:bg-white/[0.04]";

export default function About() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">

      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />

      
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative"
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-5 sm:mb-6">
          <Cpu size={12} className="animate-spin-slow" />
          About Sathi AI
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5 sm:mb-6 leading-tight">
          Built for the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
            Worst Moments
          </span>
        </h1>

        <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-2">
          Sathi.AI is a{" "}
          <span className="bg-red-500/10 px-2 py-1 rounded text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            fully offline, autonomous emergency assistant
          </span>{" "}
          designed to function when everything else fails.
        </p>
      </motion.section>

      
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center"
      >
        <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gray-500 mb-5 sm:mb-6">
          Our Mission
        </h2>

        <p className="text-lg sm:text-xl md:text-2xl font-semibold">
          No human should ever feel helpless in a crisis
        </p>
      </motion.section>

      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-xs text-center text-gray-600 mb-10">
          What Makes Sathi Different
        </h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {[
            { icon: Shield, title: "Privacy First", color: "text-green-400" },
            { icon: Globe, title: "Offline Native", color: "text-blue-400" },
            { icon: Zap, title: "Real-Time", color: "text-amber-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`p-5 sm:p-8 rounded-2xl backdrop-blur-xl border border-white/5 bg-white/[0.02] ${cardHover}`}
            >
              <item.icon className={`${item.color} mb-4`} size={28} />
              <h3 className="font-bold">{item.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <h2 className="text-xs text-center text-gray-600 mb-10">
          Core Capabilities
        </h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {[Mic, HeartPulse, MessageSquare].map((Icon, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`p-4 sm:p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl ${cardHover}`}
            >
              <Icon className="text-amber-400 mb-3" />
              <h3 className="font-bold text-sm">Feature</h3>
            </motion.div>
          ))}
        </motion.div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32 text-center">
        <h2 className="text-xs text-gray-600 mb-8">Field Systems</h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {[Globe, Radio].map((Icon, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl bg-white/[0.02] ${cardHover}`}
            >
              <Icon className="text-amber-400 mb-4 mx-auto" size={28} />
              <h3 className="font-bold">System</h3>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}