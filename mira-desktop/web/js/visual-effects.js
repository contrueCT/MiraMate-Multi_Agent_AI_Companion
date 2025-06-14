/**
 * 视觉效果处理器
 * 负责执行智能体发送的视觉效果指令
 */

class VisualEffectsProcessor {
    constructor() {
        this.effectsContainer = null
        this.currentPersistentEffect = null
        this.isEffectsEnabled = true
        this.activeTemporaryEffects = new Set()
        
        // 效果执行函数映射
        this.effectHandlers = {
            // 临时效果
            'celebration': this.applyCelebrationEffect.bind(this),
            'hearts': this.applyHeartsEffect.bind(this),
            'sparkles': this.applySparklesEffect.bind(this),
            'bubbles': this.applyBubblesEffect.bind(this),
            'flower_petals': this.applyFlowerPetalsEffect.bind(this),
            
            // 持久效果
            'warm_theme': this.applyWarmTheme.bind(this),
            'cool_theme': this.applyCoolTheme.bind(this),
            'sunset_theme': this.applySunsetTheme.bind(this),
            'night_theme': this.applyNightTheme.bind(this),
            'spring_theme': this.applySpringTheme.bind(this)
        }
        
        this.init()
    }

    init() {
        // 创建效果容器
        this.createEffectsContainer()
        
        // 从存储中读取用户偏好
        this.loadUserPreferences()
        
        console.log('✨ 视觉效果处理器初始化完成')
    }

    createEffectsContainer() {
        // 在聊天容器中创建效果层
        const chatContainer = document.querySelector('.chat-container')
        if (!chatContainer) {
            console.error('未找到聊天容器，无法创建效果层')
            return
        }

        // 创建效果容器
        this.effectsContainer = document.createElement('div')
        this.effectsContainer.className = 'visual-effects-container'
        this.effectsContainer.innerHTML = `
            <div class="temporary-effects-layer"></div>
            <div class="persistent-effects-layer"></div>
        `
        
        // 插入到聊天容器的开头
        chatContainer.insertBefore(this.effectsContainer, chatContainer.firstChild)
    }

    /**
     * 执行视觉效果指令
     * @param {Object} command - 效果指令对象
     */
    async executeVisualCommand(command) {
        if (!this.isEffectsEnabled) {
            console.log('视觉效果已禁用，跳过执行')
            return
        }

        if (!command || !command.effect_name) {
            console.warn('无效的视觉效果指令:', command)
            return
        }

        try {
            const handler = this.effectHandlers[command.effect_name]
            if (!handler) {
                console.warn(`未知的效果类型: ${command.effect_name}`)
                return
            }

            console.log(`🎨 执行视觉效果: ${command.display_name || command.effect_name}`)
            
            if (command.effect_type === 'temporary') {
                await this.applyTemporaryEffect(command, handler)
            } else if (command.effect_type === 'persistent') {
                await this.applyPersistentEffect(command, handler)
            }
            
        } catch (error) {
            console.error('执行视觉效果时发生错误:', error)
        }
    }

    /**
     * 应用临时效果
     */
    async applyTemporaryEffect(command, handler) {
        const effectId = `temp-${command.effect_name}-${Date.now()}`
        this.activeTemporaryEffects.add(effectId)
        
        try {
            await handler(command, effectId)
            
            // 设置自动清理
            if (command.duration > 0) {
                setTimeout(() => {
                    this.cleanupTemporaryEffect(effectId)
                }, command.duration)
            }
        } catch (error) {
            console.error(`临时效果执行失败: ${command.effect_name}`, error)
            this.cleanupTemporaryEffect(effectId)
        }
    }

    /**
     * 应用持久效果
     */
    async applyPersistentEffect(command, handler) {
        try {
            // 清理之前的持久效果
            if (this.currentPersistentEffect) {
                await this.cleanupPersistentEffect()
            }
            
            await handler(command)
            this.currentPersistentEffect = command.effect_name
        } catch (error) {
            console.error(`持久效果应用失败: ${command.effect_name}`, error)
        }
    }

    /**
     * 根据强度参数插值效果属性
     */
    interpolateEffectIntensity(baseValue, intensityRange, intensity) {
        if (Array.isArray(intensityRange) && intensityRange.length === 2) {
            const [min, max] = intensityRange
            if (typeof min === 'number' && typeof max === 'number') {
                return min + (max - min) * intensity
            }
        }
        return baseValue
    }

    // ==================== 临时效果实现 ====================

    async applyCelebrationEffect(command, effectId) {
        const container = this.effectsContainer.querySelector('.temporary-effects-layer')
        const params = command.parameters
        const intensity = command.intensity

        // 创建烟花容器
        const fireworksContainer = document.createElement('div')
        fireworksContainer.className = 'celebration-effect'
        fireworksContainer.setAttribute('data-effect-id', effectId)
        
        // 根据强度调整参数
        const particleCount = Math.floor(this.interpolateEffectIntensity(
            params.particle_count, [20, 100], intensity
        ))
        const animationSpeed = this.interpolateEffectIntensity(
            params.animation_speed, [0.5, 2.0], intensity
        )

        // 创建烟花粒子
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div')
            particle.className = 'celebration-particle'
            
            // 随机位置和颜色
            const x = Math.random() * 100
            const y = Math.random() * 100
            const color = params.colors[Math.floor(Math.random() * params.colors.length)]
            
            particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                background-color: ${color};
                animation-duration: ${2 / animationSpeed}s;
                animation-delay: ${Math.random() * 0.5}s;
            `
            
            fireworksContainer.appendChild(particle)
        }
        
        container.appendChild(fireworksContainer)
    }

    async applyHeartsEffect(command, effectId) {
        const container = this.effectsContainer.querySelector('.temporary-effects-layer')
        const params = command.parameters
        const intensity = command.intensity

        const heartsContainer = document.createElement('div')
        heartsContainer.className = 'hearts-effect'
        heartsContainer.setAttribute('data-effect-id', effectId)
        
        const heartCount = Math.floor(this.interpolateEffectIntensity(
            params.heart_count, [5, 30], intensity
        ))
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div')
            heart.className = 'floating-heart-particle'
            heart.innerHTML = '💖'
            
            const x = Math.random() * 100
            const delay = Math.random() * 2
            const duration = 3 + Math.random() * 2
            
            heart.style.cssText = `
                left: ${x}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                color: ${params.colors[Math.floor(Math.random() * params.colors.length)]};
            `
            
            heartsContainer.appendChild(heart)
        }
        
        container.appendChild(heartsContainer)
    }

    async applySparklesEffect(command, effectId) {
        const container = this.effectsContainer.querySelector('.temporary-effects-layer')
        const params = command.parameters
        const intensity = command.intensity

        const sparklesContainer = document.createElement('div')
        sparklesContainer.className = 'sparkles-effect'
        sparklesContainer.setAttribute('data-effect-id', effectId)
        
        const sparkleCount = Math.floor(this.interpolateEffectIntensity(
            params.sparkle_count, [10, 50], intensity
        ))
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div')
            sparkle.className = 'sparkle-particle'
            sparkle.innerHTML = '✨'
            
            const x = Math.random() * 100
            const y = Math.random() * 100
            const delay = Math.random() * 1
            const size = 12 + Math.random() * 8
            
            sparkle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                font-size: ${size}px;
                animation-delay: ${delay}s;
                color: ${params.colors[Math.floor(Math.random() * params.colors.length)]};
            `
            
            sparklesContainer.appendChild(sparkle)
        }
        
        container.appendChild(sparklesContainer)
    }

    async applyBubblesEffect(command, effectId) {
        const container = this.effectsContainer.querySelector('.temporary-effects-layer')
        const params = command.parameters
        const intensity = command.intensity

        const bubblesContainer = document.createElement('div')
        bubblesContainer.className = 'bubbles-effect'
        bubblesContainer.setAttribute('data-effect-id', effectId)
        
        const bubbleCount = Math.floor(this.interpolateEffectIntensity(
            params.bubble_count, [8, 40], intensity
        ))
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div')
            bubble.className = 'bubble-particle'
            
            const x = Math.random() * 100
            const size = 15 + Math.random() * 30
            const delay = Math.random() * 2
            const duration = 4 + Math.random() * 2
            
            bubble.style.cssText = `
                left: ${x}%;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                background: ${params.colors[Math.floor(Math.random() * params.colors.length)]};
            `
            
            bubblesContainer.appendChild(bubble)
        }
        
        container.appendChild(bubblesContainer)
    }

    async applyFlowerPetalsEffect(command, effectId) {
        const container = this.effectsContainer.querySelector('.temporary-effects-layer')
        const params = command.parameters
        const intensity = command.intensity

        const petalsContainer = document.createElement('div')
        petalsContainer.className = 'flower-petals-effect'
        petalsContainer.setAttribute('data-effect-id', effectId)
        
        const petalCount = Math.floor(this.interpolateEffectIntensity(
            params.petal_count, [8, 35], intensity
        ))
        
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div')
            petal.className = 'petal-particle'
            petal.innerHTML = '🌸'
            
            const x = Math.random() * 100
            const delay = Math.random() * 3
            const duration = 4 + Math.random() * 2
            
            petal.style.cssText = `
                left: ${x}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                color: ${params.colors[Math.floor(Math.random() * params.colors.length)]};
            `
            
            petalsContainer.appendChild(petal)
        }
        
        container.appendChild(petalsContainer)
    }

    // ==================== 持久效果实现 ====================

    async applyWarmTheme(command) {
        const params = command.parameters
        const intensity = command.intensity
        
        const brightness = this.interpolateEffectIntensity(
            params.brightness, [0.7, 1.2], intensity
        )
        const saturation = this.interpolateEffectIntensity(
            params.saturation, [0.6, 1.4], intensity
        )

        this.applyThemeStyles({
            '--theme-bg-start': params.background_gradient.start,
            '--theme-bg-middle': params.background_gradient.middle,
            '--theme-bg-end': params.background_gradient.end,
            '--theme-accent': params.accent_color,
            '--theme-text': params.text_color,
            '--theme-brightness': brightness,
            '--theme-saturation': saturation
        }, 'warm-theme')
    }

    async applyCoolTheme(command) {
        const params = command.parameters
        const intensity = command.intensity
        
        const brightness = this.interpolateEffectIntensity(
            params.brightness, [0.8, 1.1], intensity
        )
        const saturation = this.interpolateEffectIntensity(
            params.saturation, [0.5, 1.2], intensity
        )

        this.applyThemeStyles({
            '--theme-bg-start': params.background_gradient.start,
            '--theme-bg-middle': params.background_gradient.middle,
            '--theme-bg-end': params.background_gradient.end,
            '--theme-accent': params.accent_color,
            '--theme-text': params.text_color,
            '--theme-brightness': brightness,
            '--theme-saturation': saturation
        }, 'cool-theme')
    }

    async applySunsetTheme(command) {
        const params = command.parameters
        const intensity = command.intensity
        
        const brightness = this.interpolateEffectIntensity(
            params.brightness, [0.7, 1.0], intensity
        )
        const saturation = this.interpolateEffectIntensity(
            params.saturation, [0.8, 1.3], intensity
        )

        this.applyThemeStyles({
            '--theme-bg-start': params.background_gradient.start,
            '--theme-bg-middle': params.background_gradient.middle,
            '--theme-bg-end': params.background_gradient.end,
            '--theme-accent': params.accent_color,
            '--theme-text': params.text_color,
            '--theme-brightness': brightness,
            '--theme-saturation': saturation
        }, 'sunset-theme')
    }

    async applyNightTheme(command) {
        const params = command.parameters
        const intensity = command.intensity
        
        const brightness = this.interpolateEffectIntensity(
            params.brightness, [0.6, 0.9], intensity
        )
        const saturation = this.interpolateEffectIntensity(
            params.saturation, [0.5, 1.0], intensity
        )

        this.applyThemeStyles({
            '--theme-bg-start': params.background_gradient.start,
            '--theme-bg-middle': params.background_gradient.middle,
            '--theme-bg-end': params.background_gradient.end,
            '--theme-accent': params.accent_color,
            '--theme-text': params.text_color,
            '--theme-brightness': brightness,
            '--theme-saturation': saturation
        }, 'night-theme')
    }

    async applySpringTheme(command) {
        const params = command.parameters
        const intensity = command.intensity
        
        const brightness = this.interpolateEffectIntensity(
            params.brightness, [0.9, 1.3], intensity
        )
        const saturation = this.interpolateEffectIntensity(
            params.saturation, [0.7, 1.2], intensity
        )

        this.applyThemeStyles({
            '--theme-bg-start': params.background_gradient.start,
            '--theme-bg-middle': params.background_gradient.middle,
            '--theme-bg-end': params.background_gradient.end,
            '--theme-accent': params.accent_color,
            '--theme-text': params.text_color,
            '--theme-brightness': brightness,
            '--theme-saturation': saturation
        }, 'spring-theme')
    }

    applyThemeStyles(variables, themeName) {
        const appContainer = document.querySelector('.app-container')
        if (!appContainer) return

        // 移除之前的主题类
        appContainer.classList.remove('warm-theme', 'cool-theme', 'sunset-theme', 'night-theme', 'spring-theme')
        
        // 应用新的CSS变量
        Object.entries(variables).forEach(([property, value]) => {
            appContainer.style.setProperty(property, value)
        })
        
        // 添加主题类
        appContainer.classList.add(themeName)
        
        // 添加过渡效果
        appContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    // ==================== 清理方法 ====================

    cleanupTemporaryEffect(effectId) {
        if (!this.activeTemporaryEffects.has(effectId)) return
        
        const effectElement = this.effectsContainer.querySelector(`[data-effect-id="${effectId}"]`)
        if (effectElement) {
            effectElement.style.opacity = '0'
            effectElement.style.transform = 'scale(0.8)'
            
            setTimeout(() => {
                if (effectElement.parentNode) {
                    effectElement.parentNode.removeChild(effectElement)
                }
            }, 300)
        }
        
        this.activeTemporaryEffects.delete(effectId)
    }

    async cleanupPersistentEffect() {
        const appContainer = document.querySelector('.app-container')
        if (!appContainer) return

        // 逐渐恢复默认样式
        appContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        
        // 移除主题类
        appContainer.classList.remove('warm-theme', 'cool-theme', 'sunset-theme', 'night-theme', 'spring-theme')
        
        // 重置CSS变量为默认值
        const defaultVariables = {
            '--theme-bg-start': '#ff9a9e',
            '--theme-bg-middle': '#fecfef',
            '--theme-bg-end': '#fecfef',
            '--theme-accent': '#ff6b6b',
            '--theme-text': '#2c3e50',
            '--theme-brightness': '1',
            '--theme-saturation': '1'
        }
        
        Object.entries(defaultVariables).forEach(([property, value]) => {
            appContainer.style.setProperty(property, value)
        })
        
        this.currentPersistentEffect = null
    }

    // ==================== 用户偏好设置 ====================

    setEffectsEnabled(enabled) {
        this.isEffectsEnabled = enabled
        this.saveUserPreferences()
        
        if (!enabled && this.currentPersistentEffect) {
            this.cleanupPersistentEffect()
        }
    }

    isEffectsEnabledStatus() {
        return this.isEffectsEnabled
    }

    loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('visual-effects-preferences')
            if (prefs) {
                const parsed = JSON.parse(prefs)
                this.isEffectsEnabled = parsed.enabled !== false // 默认启用
            }
        } catch (error) {
            console.warn('加载视觉效果偏好设置失败:', error)
        }
    }

    saveUserPreferences() {
        try {
            const prefs = {
                enabled: this.isEffectsEnabled,
                lastUpdated: Date.now()
            }
            localStorage.setItem('visual-effects-preferences', JSON.stringify(prefs))
        } catch (error) {
            console.warn('保存视觉效果偏好设置失败:', error)
        }
    }

    // ==================== 调试和工具方法 ====================

    testEffect(effectName, intensity = 0.5) {
        const testCommand = {
            effect_name: effectName,
            effect_type: effectName.includes('theme') ? 'persistent' : 'temporary',
            intensity: intensity,
            duration: 3000,
            parameters: this.getDefaultParameters(effectName)
        }
        
        this.executeVisualCommand(testCommand)
    }

    getDefaultParameters(effectName) {
        const defaults = {
            celebration: {
                particle_count: 50,
                colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"],
                animation_speed: 1.0
            },
            hearts: {
                heart_count: 15,
                colors: ["#ff69b4", "#ff1493", "#dc143c"]
            },
            // ... 其他默认参数
        }
        
        return defaults[effectName] || {}
    }
}

// 导出类
window.VisualEffectsProcessor = VisualEffectsProcessor
