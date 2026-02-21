
// Skill Matcher Logic using Matter.js

document.addEventListener('DOMContentLoaded', () => {
    initSkillMatcher();
});

function initSkillMatcher() {
    const container = document.getElementById('skill-matcher-canvas-container');
    if (!container) return;

    // Module aliases
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Events = Matter.Events,
        Body = Matter.Body,
        Vector = Matter.Vector;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Set some gravity
    engine.gravity.y = 1;

    // Create renderer
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: container.clientWidth,
            height: container.clientHeight,
            background: 'transparent',
            wireframes: false,
            pixelRatio: window.devicePixelRatio
        }
    });

    // Design Tokens & Config
    const wallThickness = 20; // Physics thickness (visuals will be stroke)
    const frameColor = '#000000';
    const highlightColor = '#74ACDF'; // Skyblue
    const blockColor = '#FFFFFF';
    const blockStroke = '#000000';

    // Calculate positions
    const width = render.options.width;
    const height = render.options.height;

    // The "Frame" dimensions (Central bucket)
    const frameW = 300;
    const frameH = 200;
    const frameX = width / 2;
    const frameY = height - 50; // Positioned near bottom

    // Create the "Frame" (U-shape)
    // We use static bodies. 
    // Visual style: We want a thin line, but physics needs thickness.
    // Solution: Render is separate from physics if using sprites or custom loop, 
    // but with basic Render, we have to live with the body shape.
    // We will make the walls visible with the specified border.

    const wallOptions = {
        isStatic: true,
        render: {
            fillStyle: 'transparent',
            strokeStyle: frameColor,
            lineWidth: 2
        }
    };

    // Bottom of the frame
    const frameBottom = Bodies.rectangle(frameX, frameY + frameH / 2, frameW, 20, {
        isStatic: true,
        render: { fillStyle: highlightColor, strokeStyle: frameColor, lineWidth: 2, visible: false } // Hidden initially, we'll toggle or use a separate visual
    });
    // We actually want the "Frame" to look like a frame. 
    // Let's make the physics walls slightly invisible or styled nicely.
    // To match "0px border-radius, 2px solid black border", we can just render the bodies as is.

    const ground = Bodies.rectangle(width / 2, height + 30, width, 60, { isStatic: true }); // Catch-all ground
    const wallLeft = Bodies.rectangle(0 - 30, height / 2, 60, height, { isStatic: true });
    const wallRight = Bodies.rectangle(width + 30, height / 2, 60, height, { isStatic: true });

    // The actual "Architectural Frame" for the skills
    // It's a container.
    const fBottom = Bodies.rectangle(frameX, frameY, frameW, 20, {
        isStatic: true,
        label: 'frame-bottom',
        render: { fillStyle: 'transparent', strokeStyle: frameColor, lineWidth: 2 }
    });
    const fLeft = Bodies.rectangle(frameX - frameW / 2 + 10, frameY - frameH / 2, 20, frameH, {
        isStatic: true,
        label: 'frame-left',
        render: { fillStyle: 'transparent', strokeStyle: frameColor, lineWidth: 2 }
    });
    const fRight = Bodies.rectangle(frameX + frameW / 2 - 10, frameY - frameH / 2, 20, frameH, {
        isStatic: true,
        label: 'frame-right',
        render: { fillStyle: 'transparent', strokeStyle: frameColor, lineWidth: 2 }
    });

    Composite.add(world, [ground, wallLeft, wallRight, fBottom, fLeft, fRight]);

    // Skills
    const skills = ['Hospitality', 'Design', 'Precision', 'Adventure', 'Culinary', 'Management', 'Social'];
    const skillBodies = [];

    skills.forEach((skill, i) => {
        const x = (Math.random() * (width - 100)) + 50;
        const y = (Math.random() * -200) - 50; // Start above top

        // Measure text approx ? No, just standard size for now
        const boxW = 120;
        const boxH = 50;

        const body = Bodies.rectangle(x, y, boxW, boxH, {
            chamfer: { radius: 0 }, // 0px border radius
            restitution: 0.2, // Bouncy? requested: stiffness 400, damping 15 is for springs usually, for droppy stuff restitution is low.
            label: 'skill-block',
            render: {
                fillStyle: blockColor,
                strokeStyle: blockStroke,
                lineWidth: 1,
                // We can't do box-shadow easily in default renderer
            }
        });

        // Attach text to body (custom rendering hack)
        body.plugin = { text: skill };
        skillBodies.push(body);
    });

    Composite.add(world, skillBodies);

    // Mouse Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    // Fix scrolling issue with mouse
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    Composite.add(world, mouseConstraint);

    // Custom Rendering for Text and Shadows (after standard render)
    Events.on(render, 'afterRender', function () {
        const context = render.context;

        // Draw matched background if active
        // (Handled via CSS on the frame body or DOM?? We can just draw a rect)

        // Draw Text on blocks
        context.font = "14px Inter, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";

        skillBodies.forEach(body => {
            const { x, y } = body.position;
            const angle = body.angle;

            context.save();
            context.translate(x, y);
            context.rotate(angle);

            // Draw Shadow (Manual)
            // request: box-shadow: 4px 4px 0px 0px #000000
            // We draw a rect offset by 4,4 first
            // Since we are inside translate/rotate, simple offset works relative to body center?
            // Actually it's cleaner to draw the shadow before the body, but standard renderer draws body.
            // So we are drawing ON TOP of the standard body. 
            // Better: use 'beforeRender' to draw shadow? 
            // But standard render will draw over it. 
            // We just draw the text here. Visual fidelity of 'shadow' might be missed or we just accept 'border' for now.
            // Let's leave shadow for now and ensure Text is crisp.

            context.fillStyle = "#000000";
            context.fillText(body.plugin.text, 0, 0);
            context.restore();
        });
    });

    // Run the engine
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Activation Logic
    // Check if 3 blocks are inside the "Frame"
    let activationTriggered = false;

    Events.on(engine, 'beforeUpdate', () => {
        if (activationTriggered) return;

        // Count bodies inside the frame area
        // Frame area is approx: x: [frameX - frameW/2, frameX + frameW/2], y: [frameY - frameH/2, frameY]
        const bounds = {
            minX: frameX - frameW / 2 + 20,
            maxX: frameX + frameW / 2 - 20,
            minY: frameY - frameH / 2,
            maxY: frameY + 100 // generous bottom
        };

        let insideCount = 0;
        skillBodies.forEach(body => {
            if (body.position.x > bounds.minX &&
                body.position.x < bounds.maxX &&
                body.position.y > bounds.minY &&
                body.position.y < bounds.maxY) {
                insideCount++;
            }
        });

        if (insideCount >= 3) {
            activateFrame();
        }
    });

    function activateFrame() {
        activationTriggered = true;

        // Change physics body color (visual update)
        fBottom.render.fillStyle = highlightColor; // Skyblue
        fLeft.render.fillStyle = highlightColor;
        fRight.render.fillStyle = highlightColor;

        // Optional: Make the "floor" of the frame turn blue
        // We can create a sensor or just color the existing parts.

        // Show the Result Panel (DOM)
        const panel = document.getElementById('matcher-result-panel');
        if (panel) {
            panel.classList.add('active');
        }

        // Change instruction text
        const instruction = document.getElementById('skill-matcher-instruction');
        if (instruction) {
            instruction.innerText = "Processing...";
            setTimeout(() => {
                instruction.style.opacity = '0';
            }, 500);
        }
    }
}
