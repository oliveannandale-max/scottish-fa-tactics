import sys
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm, mm
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
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#002B49"))

        # Header
        self.drawString(40, A4[1] - 30, "SCOTTISH FA UEFA LICENCE TACTICAL PLATFORM")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(A4[0] - 40, A4[1] - 30, "Candidate & Coach Educator Manual v1.0")

        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(40, A4[1] - 35, A4[0] - 40, A4[1] - 35)

        # Footer
        self.line(40, 42, A4[0] - 40, 42)
        self.setFont("Helvetica", 8)
        self.drawString(40, 30, "Confidential - For Scottish FA Coaching Award Candidates & Educators")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 40, 30, page_text)

        # Subtle gold accent line
        self.setStrokeColor(colors.HexColor("#F5A800"))
        self.setLineWidth(1.5)
        self.line(A4[0] - 100, 42, A4[0] - 40, 42)

        self.restoreState()

def build_pdf(filename="Scottish_FA_Tactics_Platform_User_Manual.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Color Palette definitions
    PRIMARY = colors.HexColor("#002B49")    # SFA Deep Navy
    SECONDARY = colors.HexColor("#005EB8")  # Scottish Blue
    GOLD = colors.HexColor("#F5A800")       # Scottish Gold Accent
    TEXT_DARK = colors.HexColor("#0F172A")  # Slate 900
    TEXT_MUTED = colors.HexColor("#475569") # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography & Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=SECONDARY,
        alignment=0,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=PRIMARY,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=PRIMARY
    )

    story = []

    # ---------------------------------------------------------
    # COVER PAGE
    # ---------------------------------------------------------
    story.append(Spacer(1, 30))
    
    # Top decorative banner block
    banner_table = Table(
        [[Paragraph("<b>SCOTTISH FOOTBALL ASSOCIATION</b> &bull; COACH EDUCATION DIRECTORATE", ParagraphStyle(
            'BannerText', fontName='Helvetica-Bold', fontSize=9, textColor=GOLD, alignment=0
        ))]],
        colWidths=[A4[0] - 80]
    )
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 2, GOLD),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 40))

    story.append(Paragraph("Scottish FA UEFA Licence<br/>Tactical Platform", title_style))
    story.append(Paragraph("Official Platform Manual & Dynamic Scaffolding Guide<br/><b>UEFA C &bull; UEFA B &bull; UEFA A Licence Tiers</b>", subtitle_style))
    
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=25, spaceBefore=5))

    overview_box = [
        [Paragraph("<b>Document Purpose:</b> Complete operational guide for coach candidates, coach educators, and technical directors utilizing the Scottish FA UEFA Licence Tactical Platform. Outlines dynamic licence scaffolding, interactive pitch controls, frame-by-frame keyframe animations, TPPS player profiling, drill architectures, and automated opponent simulation engines.", body_style)],
    ]
    t_box = Table(overview_box, colWidths=[A4[0] - 80])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_box)

    story.append(Spacer(1, 50))

    meta_data = [
        [Paragraph("<b>Author / Directorate:</b>", table_cell_bold), Paragraph("Scottish FA Coach Education & Technical Department", table_cell_style)],
        [Paragraph("<b>Supported Licence Tiers:</b>", table_cell_bold), Paragraph("UEFA C Licence, UEFA B Licence, UEFA A Licence", table_cell_style)],
        [Paragraph("<b>Core Methodology:</b>", table_cell_bold), Paragraph("The Coach, The Environment, The Player, The Game (4-Pillar Model)", table_cell_style)],
        [Paragraph("<b>Software Release:</b>", table_cell_bold), Paragraph("Version 1.0.0 (Production Build - React 19 / Vite)", table_cell_style)],
        [Paragraph("<b>Live Deployment:</b>", table_cell_bold), Paragraph("https://oliveannandale-max.github.io/scottish-fa-tactics/", table_cell_style)],
        [Paragraph("<b>Repository:</b>", table_cell_bold), Paragraph("https://github.com/oliveannandale-max/scottish-fa-tactics", table_cell_style)],
    ]
    meta_table = Table(meta_data, colWidths=[160, A4[0] - 240])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 40))
    story.append(Paragraph("<i>&copy; Scottish Football Association. All rights reserved. Designed to empower Scottish coaches on UEFA accreditation pathways.</i>", ParagraphStyle('Copyright', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED, alignment=1)))

    story.append(PageBreak())

    # ---------------------------------------------------------
    # TABLE OF CONTENTS / EXECUTIVE SUMMARY
    # ---------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Core Philosophy", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "The <b>Scottish FA UEFA Licence Tactical Platform</b> is a dynamic coaching application engineered to provide candidates with a high-fidelity tactical board while structurally enforcing the Scottish Football Association’s coach education syllabus. Rather than serving as an unconstrained graphic drawing tool, the software incorporates <b>Dynamic Scaffolding</b>—an intelligent rules engine that tailors available mechanics, tactical constraints, and analytical depths to the candidate’s enrolled licence tier (UEFA C, UEFA B, or UEFA A).",
        body_style
    ))

    story.append(Paragraph("The Scottish FA 4-Pillar Coaching Model", h2_style))
    story.append(Paragraph("Every exercise, tactical animation, and assessment sheet generated by this platform aligns with four fundamental pillars:", body_style))

    pillars_data = [
        [Paragraph("<b>Pillar</b>", table_header_style), Paragraph("<b>Key Dimension</b>", table_header_style), Paragraph("<b>Platform Implementation</b>", table_header_style)],
        [
            Paragraph("<b>The Coach</b>", table_cell_bold),
            Paragraph("Behaviours, communication, and intervention methodology.", table_cell_style),
            Paragraph("Interactive coaching styles: <i>Drive-in</i>, <i>Freeze & Replay</i>, <i>Concurrent</i>, and <i>Terminal</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>The Environment</b>", table_cell_bold),
            Paragraph("Culture, pitch geometry, psych climate, and learning constraints.", table_cell_style),
            Paragraph("Dynamic pitch views: Full, Half, Penalty Box, Thirds, and Corridors.", table_cell_style)
        ],
        [
            Paragraph("<b>The Player</b>", table_cell_bold),
            Paragraph("Technical, Physical, Psychological, Social (TPPS) profiling.", table_cell_style),
            Paragraph("Integrated TPPS 4-Corner radar analysis & individual developmental notes.", table_cell_style)
        ],
        [
            Paragraph("<b>The Game</b>", table_cell_bold),
            Paragraph("Principles of play, transitions, and phased tactical problem-solving.", table_cell_style),
            Paragraph("Multi-phase session builder, opponent AI pressure modeling, and animation engine.", table_cell_style)
        ],
    ]
    p_table = Table(pillars_data, colWidths=[90, 160, A4[0] - 330])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 15))

    # ---------------------------------------------------------
    # SECTION 2: DYNAMIC TIER SCAFFOLDING MATRIX
    # ---------------------------------------------------------
    story.append(Paragraph("2. Dynamic Tier Scaffolding Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "The core innovation of the platform is that <b>UI complexity directly mirrors coaching competency expectations</b>. As a candidate transitions from UEFA C to UEFA A, UI constraints dynamically expand to accommodate higher-order tactical reasoning.",
        body_style
    ))

    tier_matrix = [
        [
            Paragraph("<b>Feature / Constraint</b>", table_header_style),
            Paragraph("<b>UEFA C Licence</b>", table_header_style),
            Paragraph("<b>UEFA B Licence</b>", table_header_style),
            Paragraph("<b>UEFA A Licence</b>", table_header_style)
        ],
        [
            Paragraph("<b>Target Domain</b>", table_cell_bold),
            Paragraph("Fundamentals, 1v1 to 5v5 small practices, youth & community.", table_cell_style),
            Paragraph("Units of play, 7v7 to 9v9, functional practices, phase play.", table_cell_style),
            Paragraph("11v11 macro strategy, opponent game plans, periodisation.", table_cell_style)
        ],
        [
            Paragraph("<b>Player Capacity</b>", table_cell_bold),
            Paragraph("Max 10 outfielders (Small-Sided Games)", table_cell_style),
            Paragraph("Max 16 players (Positional units & phased overloads)", table_cell_style),
            Paragraph("Full 22 players + Substitutes & Goalkeeping units", table_cell_style)
        ],
        [
            Paragraph("<b>Pitch Geometry</b>", table_cell_bold),
            Paragraph("Full pitch, Half pitch, Penalty box zone.", table_cell_style),
            Paragraph("Thirds of the pitch, Horizontal channels & corridors.", table_cell_style),
            Paragraph("Complete tactical zones, 18-box grid & half-spaces.", table_cell_style)
        ],
        [
            Paragraph("<b>Animation Engine</b>", table_cell_bold),
            Paragraph("Single-step ball & player transitions.", table_cell_style),
            Paragraph("Multi-frame sequence recording (up to 8 keyframes).", table_cell_style),
            Paragraph("Continuous keyframe timeline, variable speeds & looping.", table_cell_style)
        ],
        [
            Paragraph("<b>Tactical Markers</b>", table_cell_bold),
            Paragraph("Solid pass line, simple run arrows.", table_cell_style),
            Paragraph("Dashed runs, dribble squiggles, pressing zones.", table_cell_style),
            Paragraph("Half-space shaded zones, offside lines, press triggers.", table_cell_style)
        ],
        [
            Paragraph("<b>Opponent AI Presets</b>", table_cell_bold),
            Paragraph("Static mannequins & passive opposition.", table_cell_style),
            Paragraph("Reactive Mid-Block 4-4-2, High Press 4-3-3.", table_cell_style),
            Paragraph("Deep Low-Block 5-4-1, Counter-Press 3-5-2, Custom Models.", table_cell_style)
        ],
    ]
    t_matrix = Table(tier_matrix, colWidths=[100, 135, 140, 140])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_matrix)

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 3: INTERACTIVE TACTICAL PITCH STUDIO
    # ---------------------------------------------------------
    story.append(Paragraph("3. Interactive Tactical Pitch Studio", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "The Interactive Pitch is rendered in high-definition SVG with hardware-accelerated drag-and-drop mechanics. It serves as the primary canvas for session geometry and drill visualization.",
        body_style
    ))

    story.append(Paragraph("Pitch Views & Geometry Modes", h2_style))
    story.append(Paragraph("Use the top-bar pitch selector to instantly reorient session boundaries:", body_style))
    
    pitch_views = [
        [Paragraph("<b>View Mode</b>", table_header_style), Paragraph("<b>Visual Scope</b>", table_header_style), Paragraph("<b>Methodological Application</b>", table_header_style)],
        [
            Paragraph("<b>Full Pitch</b>", table_cell_bold),
            Paragraph("105m x 68m standard pitch with touchline markings.", table_cell_style),
            Paragraph("11v11 match simulations, transition sequences, counter-attack modeling.", table_cell_style)
        ],
        [
            Paragraph("<b>Half Pitch</b>", table_cell_bold),
            Paragraph("One half from halfway line to goal line.", table_cell_style),
            Paragraph("Attacking against deep blocks, phased buildup, defensive unit organization.", table_cell_style)
        ],
        [
            Paragraph("<b>Penalty Box / Final Third</b>", table_cell_bold),
            Paragraph("Focused on 18-yard box, penalty arc, and flanks.", table_cell_style),
            Paragraph("Finishing drills, crossing & cutback routines, defending crosses, set-pieces.", table_cell_style)
        ],
        [
            Paragraph("<b>Thirds View</b>", table_cell_bold),
            Paragraph("Horizontal dividing lines (Defending, Middle, Attacking).", table_cell_style),
            Paragraph("Scottish FA unit linking, zone transition rules (e.g. 3-touch in middle third).", table_cell_style)
        ],
        [
            Paragraph("<b>Channelled / Corridors</b>", table_cell_bold),
            Paragraph("5 vertical lanes (Left Flank, Half-Space, Central, Right Half-Space, Right Flank).", table_cell_style),
            Paragraph("Positional play, half-space penetration, underlapping fullbacks.", table_cell_style)
        ],
    ]
    t_pv = Table(pitch_views, colWidths=[110, 150, A4[0] - 340])
    t_pv.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_pv)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Player & Equipment Palette Controls", h2_style))
    story.append(Paragraph("&bull; <b>Adding Players:</b> Drag from the sidebar player dock onto the pitch. Players feature team color identifiers (Blue Home, Red Away, Yellow Neutral/Floater, Green Goalkeeper) and squad numbers.", bullet_style))
    story.append(Paragraph("&bull; <b>Positioning & Moving:</b> Click and drag any player across pitch zones. Positions automatically calculate percentages relative to pitch dimensions for consistent rendering across screen resolutions.", bullet_style))
    story.append(Paragraph("&bull; <b>Equipment Elements:</b> Place official training equipment including Standard Goals, Mini Pug Goals, Flat Discs/Cones (Orange/Yellow), Passing Mannequins, and Agility Hurdles.", bullet_style))
    story.append(Paragraph("&bull; <b>Player Inspection:</b> Click on any player to open the contextual TPPS quick-inspector modal for tactical role assignment.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Vector Tactical Drawing Suite", h2_style))
    story.append(Paragraph("Toggle the pencil tool to activate the vector drawing overlay with dedicated tactical stroke styles:", body_style))

    draw_tools = [
        [Paragraph("<b>Tool</b>", table_header_style), Paragraph("<b>Visual Stroke</b>", table_header_style), Paragraph("<b>Tactical Meaning in SFA Syllabus</b>", table_header_style)],
        [Paragraph("<b>Pass Arrow</b>", table_cell_bold), Paragraph("Solid crisp line with arrowhead", table_cell_style), Paragraph("Ball trajectory, ground pass, or aerial delivery.", table_cell_style)],
        [Paragraph("<b>Movement Run</b>", table_cell_bold), Paragraph("Dashed / perforated line with arrowhead", table_cell_style), Paragraph("Off-the-ball player run (overlapping, blind-side, decoy).", table_cell_style)],
        [Paragraph("<b>Dribble Line</b>", table_cell_bold), Paragraph("Wavy / undulating curve with arrowhead", table_cell_style), Paragraph("Player carrying or driving into space with the ball.", table_cell_style)],
        [Paragraph("<b>Pressing Zone</b>", table_cell_bold), Paragraph("Translucent shaded polygon overlay", table_cell_style), Paragraph("Target defensive entrapment zone or high-intensity press area.", table_cell_style)],
        [Paragraph("<b>Tactical Area</b>", table_cell_bold), Paragraph("Rectangular highlight with dashed boundary", table_cell_style), Paragraph("Designated drill boundary, overload zone, or scoring channel.", table_cell_style)],
    ]
    t_dt = Table(draw_tools, colWidths=[110, 150, A4[0] - 340])
    t_dt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_dt)

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 4: ANIMATION & KEYFRAME TIMELINE STUDIO
    # ---------------------------------------------------------
    story.append(Paragraph("4. Frame-by-Frame Keyframe Animation Engine", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "Static session diagrams often fail to convey speed of thought, anticipation, and secondary runs. The built-in <b>Keyframe Animation Studio</b> allows coaches to record multi-step tactical phases and replay them smoothly.",
        body_style
    ))

    story.append(Paragraph("Step-by-Step Animation Workflow", h2_style))
    story.append(Paragraph("<b>Step 1: Set Initial Positions (Frame 1)</b><br/>Position players and equipment on the pitch to represent the starting phase of the practice or game moment.", bullet_style))
    story.append(Paragraph("<b>Step 2: Capture Keyframe</b><br/>Click the <b>'+ Capture Frame'</b> button. The timeline stores the snapshot as Frame 1.", bullet_style))
    story.append(Paragraph("<b>Step 3: Move Elements (Frame 2)</b><br/>Drag the ball to the receiver, move defending units into compact blocks, and advance attacking runners.", bullet_style))
    story.append(Paragraph("<b>Step 4: Capture Subsequent Frames</b><br/>Repeat capture across up to 8 keyframes (UEFA B) or unlimited frames (UEFA A).", bullet_style))
    story.append(Paragraph("<b>Step 5: Playback & Verification</b><br/>Press <b>Play</b> to observe smooth interpolated motion. Adjust playback speed between <b>0.5x</b> (detailed coaching review), <b>1.0x</b> (game speed), and <b>2.0x</b> (quick overview).", bullet_style))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 5: SESSION & DRILL DESIGN STUDIO
    # ---------------------------------------------------------
    story.append(Paragraph("5. Session & Drill Design Studio", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "The Scottish FA mandates that every training practice adheres to structured pedagogical frameworks. The Session Builder enforces this rigor through standardized fields and validation checks.",
        body_style
    ))

    story.append(Paragraph("Session Metadata & SFA Coaching Intervention Matrix", h2_style))

    interventions_data = [
        [Paragraph("<b>Intervention Style</b>", table_header_style), Paragraph("<b>Trigger Moment</b>", table_header_style), Paragraph("<b>Candidate Coaching Action</b>", table_header_style)],
        [
            Paragraph("<b>Freeze & Replay</b>", table_cell_bold),
            Paragraph("Major tactical breakdown or optimal learning picture.", table_cell_style),
            Paragraph("Blow whistle, freeze players in exact positions, ask guided discovery questions, replay sequence with correct option.", table_cell_style)
        ],
        [
            Paragraph("<b>Drive-In / Coaching in the Game</b>", table_cell_bold),
            Paragraph("Targeted player requires individual instruction without stopping game.", table_cell_style),
            Paragraph("Coach steps onto pitch boundary, provides direct technical correction to individual player while drill continues.", table_cell_style)
        ],
        [
            Paragraph("<b>Concurrent Coaching</b>", table_cell_bold),
            Paragraph("Positive reinforcement or reminders during active play.", table_cell_style),
            Paragraph("Short, punchy verbal cues ('Check shoulder', 'Body shape', 'Set') without breaking player concentration.", table_cell_style)
        ],
        [
            Paragraph("<b>Terminal Intervention</b>", table_cell_bold),
            Paragraph("Interval, water break, or session conclusion.", table_cell_style),
            Paragraph("Gather squad, review key outcomes, facilitate peer reflection, check tactical understanding.", table_cell_style)
        ],
    ]
    t_int = Table(interventions_data, colWidths=[120, 150, A4[0] - 350])
    t_int.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_int)

    story.append(Spacer(1, 10))
    story.append(Paragraph("The SFA '5Ws' Tactical Framework", h2_style))
    story.append(Paragraph("Every Scottish FA assessment requires candidates to explicitly define the 5Ws for their practice:", body_style))
    story.append(Paragraph("&bull; <b>WHAT:</b> The specific technical or tactical problem (e.g. Failure to break lines through central midfield).", bullet_style))
    story.append(Paragraph("&bull; <b>WHERE:</b> The precise pitch location where the problem occurs (e.g. Middle third into attacking third).", bullet_style))
    story.append(Paragraph("&bull; <b>WHO:</b> The specific units, positions, and numbers involved (e.g. 6 & 8 vs opposing 10 & 9).", bullet_style))
    story.append(Paragraph("&bull; <b>WHEN:</b> The match moment/trigger (e.g. Immediately upon transitioning from defending to attacking).", bullet_style))
    story.append(Paragraph("&bull; <b>WHY:</b> The underlying tactical rationale (e.g. To create central overloads and destabilize opposing double pivot).", bullet_style))

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 6: TPPS PLAYER PROFILING SYSTEM
    # ---------------------------------------------------------
    story.append(Paragraph("6. Player Profiling & TPPS Radar System", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "Modern UEFA coach education prioritizes player-centered development. The platform integrates a <b>TPPS 4-Corner Radar System</b> allowing coaches to evaluate outfielders and goalkeepers across the four pillars of player capability.",
        body_style
    ))

    tpps_data = [
        [Paragraph("<b>TPPS Dimension</b>", table_header_style), Paragraph("<b>Evaluated Competencies</b>", table_header_style), Paragraph("<b>SFA Coaching Focus</b>", table_header_style)],
        [
            Paragraph("<b>Technical (T)</b>", table_cell_bold),
            Paragraph("Ball mastery, 1st touch directional control, range of passing, finishing.", table_cell_style),
            Paragraph("Execution under cognitive pressure and variable spatial constraints.", table_cell_style)
        ],
        [
            Paragraph("<b>Physical (P)</b>", table_cell_bold),
            Paragraph("Agility, acceleration, deceleration, core stability, aerial power, stamina.", table_cell_style),
            Paragraph("Tactical periodisation load, work-to-rest ratios per drill.", table_cell_style)
        ],
        [
            Paragraph("<b>Psychological (P)</b>", table_cell_bold),
            Paragraph("Decision-making speed, emotional regulation, resilience under adversity.", table_cell_style),
            Paragraph("Creating learning climates that embrace productive failure and problem-solving.", table_cell_style)
        ],
        [
            Paragraph("<b>Social (S)</b>", table_cell_bold),
            Paragraph("Communication, leadership, cohesion within units, coachability.", table_cell_style),
            Paragraph("Peer mentoring, verbal/non-verbal signaling, collective responsibility.", table_cell_style)
        ],
    ]
    t_tpps = Table(tpps_data, colWidths=[110, 170, A4[0] - 360])
    t_tpps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_tpps)

    story.append(Spacer(1, 15))

    # ---------------------------------------------------------
    # SECTION 7: OPPONENT AI & SCENARIO ENGINE
    # ---------------------------------------------------------
    story.append(Paragraph("7. Opponent Simulation & AI Tactical Engine", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "A hallmark of UEFA A and B Licence coaching is designing practices with realistic opposition behaviors. The Opponent AI engine simulates tactical shape and collective pressing shifts:",
        body_style
    ))

    story.append(Paragraph("&bull; <b>High Press 4-3-3:</b> Opposition wingers press inside-out forcing play into central traps; high defensive line compresses space.", bullet_style))
    story.append(Paragraph("&bull; <b>Mid Block 4-4-2:</b> Two compact banks of four denying space between the lines; forwards drop to screen central defensive midfielders.", bullet_style))
    story.append(Paragraph("&bull; <b>Low Block 5-4-1:</b> Dense penalty box protection, narrow defensive shape, and explosive counter-attacks into channels.", bullet_style))
    story.append(Paragraph("&bull; <b>Counter-Attacking 3-5-2:</b> High wingback positioning, aggressive transitional overloads upon ball recovery.", bullet_style))

    story.append(Spacer(1, 15))

    # ---------------------------------------------------------
    # SECTION 8: GITHUB DEPLOYMENT & SHARING
    # ---------------------------------------------------------
    story.append(Paragraph("8. GitHub Deployment, Sharing & Offline Access", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    story.append(Paragraph(
        "The platform is distributed as a cloud-ready web application with automated GitHub Actions continuous integration:",
        body_style
    ))

    git_steps = [
        [Paragraph("<b>Channel</b>", table_header_style), Paragraph("<b>URL / Command</b>", table_header_style), Paragraph("<b>Functionality</b>", table_header_style)],
        [
            Paragraph("<b>Live Cloud App</b>", table_cell_bold),
            Paragraph("https://oliveannandale-max.github.io/scottish-fa-tactics/", table_cell_style),
            Paragraph("Instant browser access on tablet, desktop, or touch displays.", table_cell_style)
        ],
        [
            Paragraph("<b>Source Code</b>", table_cell_bold),
            Paragraph("https://github.com/oliveannandale-max/scottish-fa-tactics", table_cell_style),
            Paragraph("Complete React 19 / TypeScript / Vite source code and commit history.", table_cell_style)
        ],
        [
            Paragraph("<b>Local Execution</b>", table_cell_bold),
            Paragraph("git clone &bull; npm install &bull; npm run dev", table_cell_style),
            Paragraph("Local high-speed development server at http://localhost:5173/.", table_cell_style)
        ],
    ]
    t_git = Table(git_steps, colWidths=[100, 200, A4[0] - 380])
    t_git.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_git)

    story.append(Spacer(1, 15))

    # ---------------------------------------------------------
    # SECTION 9: KEYBOARD SHORTCUTS & CANDIDATE FAQ
    # ---------------------------------------------------------
    story.append(Paragraph("9. Candidate Quick Reference & Shortcuts", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=10))

    shortcuts = [
        [Paragraph("<b>Key Combination</b>", table_header_style), Paragraph("<b>Action / Studio Function</b>", table_header_style)],
        [Paragraph("<b>Spacebar</b>", table_cell_bold), Paragraph("Play / Pause tactical animation timeline", table_cell_style)],
        [Paragraph("<b>Delete / Backspace</b>", table_cell_bold), Paragraph("Remove selected player, equipment item, or tactical drawing line", table_cell_style)],
        [Paragraph("<b>Ctrl + Z / Cmd + Z</b>", table_cell_bold), Paragraph("Undo previous tactical placement or drawing stroke", table_cell_style)],
        [Paragraph("<b>Number Keys 1 - 3</b>", table_cell_bold), Paragraph("Instantly switch Licence Tier (1: UEFA C, 2: UEFA B, 3: UEFA A)", table_cell_style)],
        [Paragraph("<b>P</b>", table_cell_bold), Paragraph("Toggle Drawing Pencil Tool on/off", table_cell_style)],
        [Paragraph("<b>Esc</b>", table_cell_bold), Paragraph("Close open modal (TPPS Radar, Mentor AI, Session Inspector)", table_cell_style)],
    ]
    t_sc = Table(shortcuts, colWidths=[150, A4[0] - 230])
    t_sc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_sc)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated manual at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    out_pdf = "Scottish_FA_UEFA_Licence_Tactical_Platform_Manual.pdf"
    build_pdf(out_pdf)
