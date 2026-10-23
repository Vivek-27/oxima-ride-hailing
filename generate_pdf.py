import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header
        self.drawString(54, 11 * 72 - 36, "OXIMA - Full-Stack Architecture & Code Engineering Master Manual")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 36, page_text)
        self.drawString(54, 36, "Confidential - Oxima Engineering Specification")
        self.line(54, 46, 8.5 * 72 - 54, 46)
        self.restoreState()

def build_pdf(filename="OXIMA_MASTER_DOCUMENTATION.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0f172a"),
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#0284c7"),
        alignment=0
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#075985"),
        backColor=colors.HexColor("#f0f9ff"),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    elements = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("OXIMA PLATFORM", ParagraphStyle('Pill', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#0284c7"))))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Master Engineering & Architectural Documentation", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("A Complete Zero-to-Mastery Technical Manual Explaining Architecture, Frontend, Backend, Databases, Real-Time Streaming, Mathematical Formulas, and Line-by-Line Code Operations", subtitle_style))
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=20))

    meta_data = [
        [Paragraph("<b>Project:</b> Oxima Enterprise Ride-Hailing Platform", body_style), Paragraph("<b>Version:</b> 2.4.0 (Production)", body_style)],
        [Paragraph("<b>Author:</b> Oxima Core Architecture Team", body_style), Paragraph("<b>Date:</b> September 2026", body_style)],
        [Paragraph("<b>Target Audience:</b> Full-Stack Engineers, DevOps, Architects", body_style), Paragraph("<b>Coverage:</b> 100% Codebase & Algorithms", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 250])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(meta_table)

    elements.append(Spacer(1, 30))
    elements.append(Paragraph("<b>Table of Contents Overview:</b>", h3_style))
    toc_items = [
        "1. Executive System Architecture & Microservices vs Monolith Design",
        "2. Frontend Engineering (React 18, Hooks, Context API, Vite, Tailwind CSS)",
        "3. Backend Core (Node.js Event Loop, Express Middleware, app.js vs server.js)",
        "4. Databases & Caching (MongoDB 2dsphere Geospatial & Redis GEO / 3hr TTL)",
        "5. Real-Time Telemetry & Messaging (Apache Kafka vs RabbitMQ & Socket.IO 4)",
        "6. Routing Algorithms, Math Formulas & Haversine Spherical Trigonometry",
        "7. Line-by-Line Code Breakdown of Core Application Files",
        "8. Docker Multi-Stage Containerization & CI/CD Deployment Guide"
    ]
    for item in toc_items:
        elements.append(Paragraph(f"• {item}", body_style))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 1: ARCHITECTURE
    # =========================================================================
    elements.append(Paragraph("1. Executive System Architecture & Design", h1_style))
    elements.append(Paragraph(
        "Oxima is built as a highly resilient, low-latency, modular distributed ride-hailing architecture designed to handle thousands of concurrent riders and drivers across all regions of India. The architecture separates high-speed geospatial read/write operations from heavy database persistence and event streaming.",
        body_style
    ))

    arch_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Technology</b>", body_style), Paragraph("<b>Architectural Responsibility</b>", body_style)],
        [Paragraph("Client Layer", body_style), Paragraph("React 18 + Vite + Leaflet", body_style), Paragraph("Responsive mobile UI, map rendering, road polylines, user inputs", body_style)],
        [Paragraph("API Gateway / REST", body_style), Paragraph("Express.js 4 on Node.js", body_style), Paragraph("Authentication, fare calculation, ride lifecycles, validation", body_style)],
        [Paragraph("WebSocket Gateway", body_style), Paragraph("Socket.IO 4", body_style), Paragraph("Full-duplex live location tracking, driver presence, offers", body_style)],
        [Paragraph("Spatial Cache & TTL", body_style), Paragraph("Redis 7 (ioredis)", body_style), Paragraph("Sub-millisecond GEO indexing, 3-hour city surge expiration", body_style)],
        [Paragraph("Primary Database", body_style), Paragraph("MongoDB 7 (2dsphere)", body_style), Paragraph("ACID document persistence, historical trips, financial transactions", body_style)],
        [Paragraph("Event Streaming Bus", body_style), Paragraph("Apache Kafka 7.5", body_style), Paragraph("Telemetry data streaming, billing events, analytics audit log", body_style)],
        [Paragraph("Routing Engine", body_style), Paragraph("OSRM Driving API", body_style), Paragraph("Turn-by-turn road network calculation via Contraction Hierarchies", body_style)]
    ]
    arch_table = Table(arch_data, colWidths=[110, 130, 260])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(arch_table)

    elements.append(Spacer(1, 12))
    elements.append(Paragraph("<b>Modular Monolith vs Microservices:</b>", h2_style))
    elements.append(Paragraph(
        "Oxima employs a <i>Modular Monolith</i> architecture with asynchronous microservice integration (Kafka & Redis). This avoids distributed transaction overhead and network latency while allowing individual subsystems (like billing or geospatial tracking) to be extracted into standalone serverless containers whenever traffic scales.",
        body_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 2: FRONTEND DEEP DIVE (REACT HOOKS & CONTEXT API)
    # =========================================================================
    elements.append(Paragraph("2. Frontend Engineering: React 18, Hooks & Context API", h1_style))
    elements.append(Paragraph(
        "The frontend is built with React 18 and Vite. React utilizes a Virtual DOM (VDOM) and Fiber Reconciliation to update only changed components in the DOM tree.",
        body_style
    ))

    elements.append(Paragraph("A. Deep Dive into React Hooks", h2_style))

    hook_data = [
        [Paragraph("<b>Hook</b>", body_style), Paragraph("<b>What it does & Why it is used</b>", body_style), Paragraph("<b>Concrete Oxima Implementation</b>", body_style)],
        [
            Paragraph("<code>useEffect</code>", body_style),
            Paragraph("Executes side-effects (API calls, subscriptions, timers, map events) after render. Accepts a dependency array: empty <code>[]</code> runs once on mount; dependencies <code>[dep]</code> re-run only when value changes. Return function handles cleanup.", body_style),
            Paragraph("In <code>DriverDashboard.jsx</code>, <code>useEffect</code> subscribes to Socket.IO events on mount and removes listeners on unmount to prevent memory leaks.", body_style)
        ],
        [
            Paragraph("<code>useState</code>", body_style),
            Paragraph("Declares reactive state variables. When updated via setter, React schedules a re-render of the component. Preserves values across renders.", body_style),
            Paragraph("In <code>RiderDashboard.jsx</code>, tracks <code>pickup</code>, <code>destination</code>, <code>activeRide</code>, and <code>nearbyDrivers</code>.", body_style)
        ],
        [
            Paragraph("<code>useRef</code>", body_style),
            Paragraph("Creates a mutable reference object (<code>.current</code>) that persists across renders without triggering a re-render when mutated. Used for DOM nodes, intervals, and simulation step trackers.", body_style),
            Paragraph("In <code>DriverDashboard.jsx</code>, <code>simIntervalRef</code> and <code>currentSimStepRef</code> store the simulation timer ID without causing unwanted re-renders.", body_style)
        ],
        [
            Paragraph("<code>useContext</code>", body_style),
            Paragraph("Consumes values from a React Context directly without prop drilling across intermediate components.", body_style),
            Paragraph("Used via <code>useAuth()</code> and <code>useSocket()</code> to access user token, profile, and the active WebSocket instance anywhere in the app.", body_style)
        ]
    ]
    hook_table = Table(hook_data, colWidths=[90, 210, 200])
    hook_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(hook_table)

    elements.append(Spacer(1, 12))
    elements.append(Paragraph("B. The React Context API Explained", h2_style))
    elements.append(Paragraph(
        "<b>What is Context API?</b> It is React's built-in global state management mechanism designed to avoid 'prop drilling' (passing props through 5-10 intermediate components). It consists of a <code>createContext()</code> factory, a <code>&lt;Context.Provider value={...}&gt;</code>, and consumers via <code>useContext()</code>.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Why we use it in Oxima:</b> We use <code>AuthContext.jsx</code> to persist JWT tokens in <code>localStorage</code>, manage login/logout state, and decode user roles. We use <code>SocketContext.jsx</code> to establish a single, shared WebSocket connection so the entire application shares one socket connection rather than creating duplicate connections per page.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Alternatives to Context API:</b><br/>"
        "• <b>Redux Toolkit:</b> Best for complex state transitions with time-travel debugging (heavier boilerplate).<br/>"
        "• <b>Zustand:</b> Lightweight hook-based store without Context Providers.<br/>"
        "• <b>MobX:</b> Reactive observable store.",
        callout_style
    ))

    elements.append(Spacer(1, 8))
    elements.append(Paragraph("C. Vite vs Webpack & Tailwind CSS", h2_style))
    elements.append(Paragraph(
        "<b>Why Vite 6?</b> Webpack bundles the entire codebase before serving. Vite serves source code over native ES Modules (ESM) and leverages <b>esbuild</b> (written in Go) for pre-bundling, delivering instant start times (&lt;100ms) and lightning-fast Hot Module Replacement (HMR).<br/>"
        "<b>Tailwind CSS:</b> Uses a Just-In-Time (JIT) compiler to generate exact CSS rules on demand, keeping the production CSS bundle under 40 KB.",
        body_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 3: BACKEND CORE (EXPRESS, MIDDLEWARES, APP.JS VS SERVER.JS)
    # =========================================================================
    elements.append(Paragraph("3. Backend Engineering: Node.js & Express Architecture", h1_style))
    elements.append(Paragraph(
        "<b>What is Node.js?</b> Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine. It uses an asynchronous, single-threaded Event Loop backed by <b>libuv</b> for non-blocking I/O operations (file system, network sockets, database queries).",
        body_style
    ))

    elements.append(Paragraph("A. app.js vs server.js: Architectural Separation of Concerns", h2_style))
    elements.append(Paragraph(
        "In production enterprise systems, <code>app.js</code> and <code>server.js</code> must be strictly decoupled:<br/>"
        "• <b>app.js:</b> Configures Express application logic, security headers, middleware chains, route definitions, and the 404/global error handlers. It does <i>not</i> listen to a network port. This allows automated unit & integration testing with Supertest without port collisions.<br/>"
        "• <b>server.js:</b> The entry point responsible for environment bootstrapping: connecting to MongoDB, Redis, and Kafka, instantiating the HTTP server, attaching WebSockets (Socket.IO), and listening on the designated PORT with graceful shutdown listeners.",
        body_style
    ))

    elements.append(Paragraph("B. The Express Middleware Pipeline", h2_style))
    elements.append(Paragraph(
        "A middleware is a function with access to the Request object (<code>req</code>), Response object (<code>res</code>), and the <code>next()</code> function in the cycle. Oxima executes the following pipeline in exact order:",
        body_style
    ))

    mw_data = [
        [Paragraph("<b>Middleware</b>", body_style), Paragraph("<b>Functionality & Security Purpose</b>", body_style)],
        [Paragraph("<code>helmet()</code>", body_style), Paragraph("Sets secure HTTP response headers (HSTS, CSP, X-Frame-Options) to protect against XSS and clickjacking.", body_style)],
        [Paragraph("<code>cors()</code>", body_style), Paragraph("Cross-Origin Resource Sharing validator allowing the Vite frontend origin while blocking unauthorized origins.", body_style)],
        [Paragraph("<code>express.json()</code>", body_style), Paragraph("Parses incoming JSON request bodies with payload size limits (e.g. 10kb) to prevent DoS attacks.", body_style)],
        [Paragraph("<code>rateLimit()</code>", body_style), Paragraph("IP-based rate limiter (e.g. max 100 requests per 15 minutes) preventing brute force and DDoS flooding.", body_style)],
        [Paragraph("<code>protect</code>", body_style), Paragraph("Custom JWT middleware: extracts Bearer token, verifies cryptographic signature, attaches decoded user to <code>req.user</code>.", body_style)],
        [Paragraph("<code>restrictTo('admin')</code>", body_style), Paragraph("Role-Based Access Control (RBAC): enforces that only authorized roles can invoke administrative endpoints.", body_style)],
        [Paragraph("<code>validate(zodSchema)</code>", body_style), Paragraph("Zod runtime validation: ensures incoming body and params conform strictly to schema before controller execution.", body_style)],
        [Paragraph("<code>errorHandler</code>", body_style), Paragraph("Global error catcher: catches operational errors (<code>AppError</code>) and formats clean JSON responses.", body_style)]
    ]
    mw_table = Table(mw_data, colWidths=[150, 350])
    mw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(mw_table)

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 4: DATABASES & CACHING (MONGODB & REDIS)
    # =========================================================================
    elements.append(Paragraph("4. Databases & Caching: MongoDB 7 & Redis 7", h1_style))
    elements.append(Paragraph(
        "<b>What is MongoDB?</b> A NoSQL document database storing data in flexible BSON format (Binary JSON). Oxima utilizes MongoDB for core entities (Users, Drivers, Rides, Transactions).",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Geospatial 2dsphere Indexes:</b> MongoDB models coordinates as GeoJSON Point <code>[longitude, latitude]</code> and indexes them using a 2dsphere index on Earth's WGS84 ellipsoid. This enables <code>$near</code> and <code>$geoWithin</code> queries with spherical accuracy.",
        body_style
    ))

    elements.append(Paragraph("A. Redis 7: In-Memory Spatial Engine & 3-Hour City Surge TTL", h2_style))
    elements.append(Paragraph(
        "<b>What is Redis?</b> Remote Dictionary Server (Redis) is an ultra-fast in-memory key-value data structure store executing operations with sub-millisecond latency.",
        body_style
    ))

    redis_data = [
        [Paragraph("<b>Redis Command / Structure</b>", body_style), Paragraph("<b>How Oxima Uses It</b>", body_style)],
        [Paragraph("<code>GEOADD key lon lat member</code>", body_style), Paragraph("Stores driver coordinates into geospatial index <code>oxima:drivers:locations</code> encoded as 52-bit Geohashes.", body_style)],
        [Paragraph("<code>GEOSEARCH / GEORADIUS</code>", body_style), Paragraph("Queries all online drivers within a 20 KM radius of pickup coordinates in &lt;1 millisecond.", body_style)],
        [Paragraph("<code>SET key val EX 10800</code>", body_style), Paragraph("Sets City Surge Multiplier with an exact 3-Hour Time-To-Live (TTL = 10,800s). Reverts to 1.0x automatically on expiry.", body_style)],
        [Paragraph("<code>ZREM member</code>", body_style), Paragraph("Removes driver from spatial search pool immediately when driver clicks 'Go Offline' or disconnects.", body_style)]
    ]
    redis_table = Table(redis_data, colWidths=[180, 320])
    redis_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0369a1")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(redis_table)

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        "<b>Database Alternatives:</b><br/>"
        "• <b>PostgreSQL + PostGIS:</b> Best relational database for complex polygon spatial queries.<br/>"
        "• <b>Memcached:</b> Pure key-value caching (lacks Redis GEO, Sets, and Pub/Sub).<br/>"
        "• <b>Dragonfly / KeyDB:</b> Multi-threaded Redis drop-in replacements for extreme throughput.",
        callout_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 5: REAL-TIME STREAMING (KAFKA & SOCKET.IO)
    # =========================================================================
    elements.append(Paragraph("5. Real-Time Telemetry: Apache Kafka & Socket.IO 4", h1_style))

    elements.append(Paragraph("A. Apache Kafka 7.5: High-Throughput Event Streaming", h2_style))
    elements.append(Paragraph(
        "<b>What is Kafka?</b> Apache Kafka is a distributed event store and stream-processing platform. It organizes events into partitioned, append-only commit logs called <b>Topics</b>. Producers publish telemetry events, while Consumers read them independently using Consumer Groups.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Oxima Kafka Topics:</b><br/>"
        "1. <code>oxima.driver.locations</code>: Streams high-frequency GPS coordinate updates (latitude, longitude, heading, speed).<br/>"
        "2. <code>oxima.ride.status</code>: Emits state transitions (REQUESTED, ACCEPTED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED).<br/>"
        "3. <code>oxima.billing.events</code>: Emits financial transaction logs for automated platform revenue audit.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Graceful Fallback Mode:</b> If Kafka is unreachable or offline in local development, Oxima automatically switches to an in-memory logger fallback without crashing the HTTP server.",
        callout_style
    ))

    elements.append(Paragraph("B. WebSockets & Socket.IO 4", h2_style))
    elements.append(Paragraph(
        "Socket.IO provides full-duplex, bidirectional communication. Oxima uses Socket.IO <b>Rooms</b> for multi-tenant isolation:<br/>"
        "• <code>user:&lt;userId&gt;</code>: Direct passenger notifications (ride accepted, driver arrived).<br/>"
        "• <code>driver:&lt;driverId&gt;</code>: Incoming ride offers dispatched to specific drivers.<br/>"
        "• <code>ride:&lt;rideId&gt;</code>: Live turn-by-turn trip tracking shared between driver and passenger.<br/>"
        "• <code>admin:fleet</code>: Real-time fleet monitoring stream for the Admin operations cockpit.",
        body_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 6: MATHEMATICS, ALGORITHMS & ROUTING ENGINE
    # =========================================================================
    elements.append(Paragraph("6. Algorithms, Mathematical Formulas & Routing Engine", h1_style))

    elements.append(Paragraph("A. Haversine Great-Circle Distance Formula", h2_style))
    elements.append(Paragraph(
        "Calculates the shortest distance over Earth's surface between two points $(lat_1, lon_1)$ and $(lat_2, lon_2)$ given radius $R = 6371$ km (or $6,371,000$ meters):",
        body_style
    ))
    elements.append(Paragraph(
        "$$\\Delta \\phi = \\frac{(lat_2 - lat_1) \\cdot \\pi}{180}, \\quad \\Delta \\lambda = \\frac{(lon_2 - lon_1) \\cdot \\pi}{180}$$<br/>"
        "$$a = \\sin^2\\left(\\frac{\\Delta \\phi}{2}\\right) + \\cos\\left(\\frac{lat_1 \\cdot \\pi}{180}\\right) \\cdot \\cos\\left(\\frac{lat_2 \\cdot \\pi}{180}\\right) \\cdot \\sin^2\\left(\\frac{\\Delta \\lambda}{2}\\right)$$<br/>"
        "$$c = 2 \\cdot \\arctan2\\left(\\sqrt{a}, \\sqrt{1-a}\\right), \\quad d = R \\cdot c$$",
        code_style
    ))

    elements.append(Paragraph("B. 20-Meter Proximity Arrival Algorithm", h2_style))
    elements.append(Paragraph(
        "When a driver arrives at pickup, Oxima calculates $d_{\\text{meters}} = \\text{Haversine}(lat_{\\text{driver}}, lon_{\\text{driver}}, lat_{\\text{pickup}}, lon_{\\text{pickup}}) \\times 1000$.<br/>"
        "If $d_{\\text{meters}} &gt; 20$, the frontend disables the PIN input and displays distance remaining. Backend enforces $d_{\\text{meters}} \\le 50$ (allowing 30m GPS drift tolerance) before starting the ride.",
        body_style
    ))

    elements.append(Paragraph("C. Dynamic Fare & City Surge Formula", h2_style))
    elements.append(Paragraph(
        "$$\\text{Total Fare (₹)} = \\max\\Big(\\text{MinFare}, \\;\\big(\\text{BaseFare} + (d_{\\text{km}} \\times \\text{PerKmRate}) + (t_{\\text{mins}} \\times \\text{PerMinRate})\\big) \\times \\text{CitySurgeMultiplier}\\Big)$$",
        code_style
    ))

    elements.append(Paragraph("D. OSRM Road Navigation & Contraction Hierarchies", h2_style))
    elements.append(Paragraph(
        "Oxima queries the Open Source Routing Machine (OSRM) driving API (<code>/route/v1/driving/...</code>). OSRM uses <b>Contraction Hierarchies (CH)</b> to preprocess OpenStreetMap road networks, calculating turn-by-turn road paths in &lt;5 milliseconds rather than traditional Dijkstra on raw graph nodes.",
        body_style
    ))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 7: LINE-BY-LINE CODE WALKTHROUGH
    # =========================================================================
    elements.append(Paragraph("7. Line-by-Line Code Breakdown of Core Files", h1_style))

    files_breakdown = [
        (
            "client/src/components/MapView.jsx",
            "1. Leaflet Container setup with MapContainer, TileLayer (CartoDB Voyager).\n"
            "2. MapControls: custom useMap() hook providing Recenter button (fits bounds to route) and Zoom +/- buttons.\n"
            "3. Initial fit bounds guard (initialFitDoneRef) preserves manual user zoom and prevents unwanted view resets.\n"
            "4. Marker Rendering: generates distinct SVG discs with heading rotation for Moto, Auto, Mini, Sedan, SUV, EV.\n"
            "5. Polyline Layers: renders Apple Blue route for trip and amber dashed polyline for driver-to-pickup path."
        ),
        (
            "client/src/pages/DriverDashboard.jsx",
            "1. State declarations: driverProfile, isOnline (default false), activeRide, currentCoords, simSpeedIdx.\n"
            "2. getDistanceToPickupMeters(): computes real-time distance in meters between driver GPS and pickup point.\n"
            "3. SIM_SPEEDS array: controls simulation multiplier: 1x (1200ms), 2x (600ms), 5x (250ms), 10x (80ms).\n"
            "4. startDriveSimulation(): advances vehicle step-by-step along OSRM road waypoints and emits updates via Socket.IO.\n"
            "5. beforeunload listener: automatically sets driver status to OFFLINE if user closes the browser tab."
        ),
        (
            "server/src/services/fareService.js",
            "1. VEHICLE_PRICING dictionary: specifies base fare, per KM, per minute, min fare for all 6 vehicle types in INR.\n"
            "2. setCitySurge(cityId, multiplier): writes JSON record with 3-hour TTL (10,800 seconds) to Redis.\n"
            "3. getSurgeMultiplier(lat, lng): checks active city surge in Redis; reverts to 1.0x if expiresAt < Date.now().\n"
            "4. getAllCitySurges(): aggregates active multipliers and calculates remaining time (e.g. '2h 45m remaining')."
        ),
        (
            "server/src/controllers/driverController.js",
            "1. startRide(): validates driver proximity to pickup (<= 50m tolerance) and checks 4-digit PIN match.\n"
            "2. completeRide(): transitions ride to COMPLETED, marks payment PAID (Cash/UPI), credits driver wallet (85%).\n"
            "3. updateStatus(): toggles ONLINE/OFFLINE, manages Redis GEO index, and broadcasts to admin fleet room."
        )
    ]

    for fname, desc in files_breakdown:
        elements.append(Paragraph(f"<b>File: {fname}</b>", h3_style))
        elements.append(Paragraph(desc.replace("\n", "<br/>"), body_style))
        elements.append(Spacer(1, 4))

    elements.append(PageBreak())

    # =========================================================================
    # SECTION 8: DOCKER & DEPLOYMENT GUIDE
    # =========================================================================
    elements.append(Paragraph("8. Docker Multi-Stage Containerization Guide", h1_style))
    elements.append(Paragraph(
        "<b>Multi-Stage Build Benefits:</b><br/>"
        "1. <i>Minimal Image Footprint:</i> Build dependencies (Vite, Rollup, devDependencies) are discarded in Stage 1.<br/>"
        "2. <i>Security Hardening:</i> Non-root user execution (<code>USER node</code>) prevents container breakout.<br/>"
        "3. <i>Dumb-Init Signal Handling:</i> Handles PID 1 SIGTERM/SIGINT signals for graceful server shutdown.<br/>"
        "4. <i>Automated Healthchecks:</i> Periodically pings <code>/api/v1/health</code> to ensure zero-downtime restarts.",
        body_style
    ))

    elements.append(Paragraph("<b>Docker Compose Quickstart:</b>", h3_style))
    elements.append(Paragraph(
        "# 1. Build and start all 5 containers (Mongo, Redis, Kafka, Zookeeper, Oxima)<br/>"
        "docker-compose up --build -d<br/><br/>"
        "# 2. Verify all services are healthy<br/>"
        "docker-compose ps<br/><br/>"
        "# 3. Access Oxima at http://localhost:5000",
        code_style
    ))

    elements.append(Spacer(1, 15))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=15))
    elements.append(Paragraph("<b>End of Oxima Master Architectural Documentation</b>", ParagraphStyle('End', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#0284c7"), alignment=1)))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    build_pdf()
