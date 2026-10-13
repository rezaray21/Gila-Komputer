'use client'

import { motion } from 'framer-motion'

export default function Hero3D() {
	return (
		<div className="hero-scene" aria-label="Ilustrasi workstation Gila Komputer">
			<div className="scene-glow scene-glow-one" />
			<div className="scene-glow scene-glow-two" />
			<motion.div className="orbit orbit-one" animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }} />
			<motion.div className="orbit orbit-two" animate={{ rotate: -360 }} transition={{ duration: 34, repeat: Infinity, ease: 'linear' }} />
			<motion.div
				className="workstation"
				initial={{ opacity: 0, y: 40, rotateX: 14, rotateY: -18 }}
				animate={{ opacity: 1, y: [0, -10, 0], rotateX: 8, rotateY: -12 }}
				transition={{ opacity: { duration: 0.8 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, rotateX: { duration: 1.2 }, rotateY: { duration: 1.2 } }}
			>
				<div className="monitor"><div className="monitor-screen"><div className="screen-line screen-line-long" /><div className="screen-line screen-line-short" /><div className="screen-core"><strong>GILA</strong><span>EDITION 01</span></div><div className="screen-grid" /></div><div className="monitor-stand" /></div>
				<div className="tower"><div className="tower-light" /><div className="tower-fan tower-fan-one" /><div className="tower-fan tower-fan-two" /><div className="tower-panel" /></div>
				<div className="desk" /><div className="keyboard" />
			</motion.div>
			<div className="scene-label scene-label-top">Siap Jadi / Rakit Sendiri</div>
			<div className="scene-label scene-label-bottom">RTX // 4K // QUIET</div>
		</div>
	)
}
