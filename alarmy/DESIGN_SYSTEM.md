# 🎨 Alarmy App - Visual & UX Reference

## Screen Layout Overview

### 1. Báo Thức (Alarms) - Alarm Management
```
┌─────────────────────────────────┐
│  Báo Thức          [+]          │  Header with add button
├─────────────────────────────────┤
│                                 │
│  07:00 AM ✓                     │  Alarm cards showing:
│  Thức dậy sáng   ▼              │  - Time
│  T2 T3 T4 T5 T6 (5 days)        │  - Label
│                                 │  - Enabled/disabled
│  ─────────────────────────────  │  - Days active
│                                 │
│  09:30 AM ✕                     │
│  Họp họp    ▼                   │
│  Hàng ngày (Every day)          │
│                                 │
│  "Báo thức tiếp theo..."        │  Next alarm info
│  "... sau X giờ Y phút"         │
│                                 │
└─────────────────────────────────┘
```

### 2. Sáng (Morning Routine) - ✨ NEW
```
┌─────────────────────────────────┐
│  Sáng                           │  Header with date
│  CN, 28/1                       │  
├─────────────────────────────────┤
│ ☀️ Thức dậy lúc                 │  Wake-up info card
│    07:00                        │  (blue bar on left)
│    [✏️]                         │
├─────────────────────────────────┤
│ Thói quen sáng          3/4     │  Progress header
│ ███████░░░░░░░░░░ 75%          │  Progress bar
│                                 │
│ ✓ Uống nước          07:05      │  Completed routine
│   ~2 phút                       │  
│                                 │
│ ○ Giãn cơ 5 phút     ~5 phút    │  Incomplete routine
│                                 │
│ ✓ Thiền 1 phút       07:10      │  Completed
│   ~1 phút                       │
│                                 │
│ ○ Đọc lời cầu        ~3 phút    │  Incomplete
│                                 │
│ [+ Thêm thói quen khác]         │  Add more button
│                                 │
│ Gợi ý khác                      │  Suggestions section
│ □ Tắm nước nóng  [+]            │
│ □ Thể dục sáng   [+]            │
│                                 │
└─────────────────────────────────┘
```

### 3. Giấc Ngủ (Sleep Tracking) - ✨ NEW
```
┌─────────────────────────────────┐
│  Giấc Ngủ                       │  Header
├─────────────────────────────────┤
│                                 │
│    ╱─╲ (Arc gauge)              │  Sleep quality score
│   │ 63 │  Điểm chất lượng       │  
│    ╲─╱                          │
│                                 │
│  Tìm hiểu vấn đề về giấc ngủ   │  Description
│  của bạn                        │
│                                 │
│  Bạn có thể ngủ...             │  Time available
│  7h 30m kể từ bây giờ          │
│                                 │
│  [➕ Theo dõi giấc ngủ]         │  Track button
│                                 │
├─────────────────────────────────┤
│ Ghi lại gần đây                 │  Recent records
│                                 │
│ [2024-01-28] 7h 45m     90%     │  Record cards
│             Chất lượng  [90% badge]
│                                 │
│ [2024-01-27] 8h 20m     75%     │
│             Chất lượng  [75% badge]
│                                 │
├─────────────────────────────────┤
│ Thống kê 7 ngày                 │  Statistics
│                                 │
│ Trung bình    Chất lượng  Ngày  │
│   8h 5m         82%        7    │
│                                 │
│ [Báo cáo giấc ngủ →]           │  Report button
│                                 │
└─────────────────────────────────┘
```

### 4. Báo Cáo (Report) - ✨ NEW
```
┌─────────────────────────────────┐
│  Báo Cáo                        │  Header
├─────────────────────────────────┤
│  ← Tuần này         →           │  Week navigation
├─────────────────────────────────┤
│  [☀️ Thức dậy] [🌙 Giấc ngủ]    │  Tabs
├─────────────────────────────────┤
│                                 │
│ WAKE-UP TAB:                    │
│ ┌────────────────────────────┐  │
│ │  Hoàn thành    Chuỗi    TB │  │ Stats cards
│ │      2          1      7:15│  │
│ └────────────────────────────┘  │
│                                 │
│ Hoạt động hàng ngày             │  Activity grid
│ [✓][✓][ ][✓][ ][✓][✓]          │
│  CN T2 T3 T4 T5 T6 T7          │
│                                 │
│ Chi tiết                        │  Details
│ ┌──────────────────────────┐   │
│ │ ✓ 2024-01-28  07:15      │   │ Record items
│ │   Hoàn thành             │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ✕ 2024-01-27  06:45      │   │
│ │   Chưa hoàn thành        │   │
│ └──────────────────────────┘   │
│                                 │
│ SLEEP TAB:                      │
│ ┌────────────────────────────┐  │
│ │  Trung bình    Chất lượng  │  │
│ │    8h 15m        85%       │  │
│ └────────────────────────────┘  │
│                                 │
│ Biểu đồ giấc ngủ                │  Duration chart
│   █ ██ ███ ██ █ ██ ██          │
│   CN T2 T3 T4 T5 T6 T7         │
│                                 │
│ Chi tiết                        │
│ ┌──────────────────────────┐   │
│ │ 🌙 2024-01-28            │   │
│ │   8h 20m • Chất lượng 92% │   │
│ │                    [92%] │   │
│ └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 5. Cài đặt (Settings)
```
┌─────────────────────────────────┐
│  Cài đặt                        │  Header
├─────────────────────────────────┤
│                                 │
│ [Account Card with upgrade]     │  Account section
│ [Pro features card]             │
│                                 │
│ Tối ưu hóa báo thức      [→]    │  Menu items
│ Báo thức                 [→]    │
│ Tắt báo thức/Nhiệm vụ    [→]    │
│ Chung                    [→]    │
│ Bảng ghi chú             [→]    │
│ Các câu hỏi thường gặp   [→]    │
│ Gửi phản hồi             [→]    │
│ Báo cáo vi phạm bản quyền[→]    │
│ Thông tin về ứng dụng    [→]    │
│                                 │
└─────────────────────────────────┘
```

## Color Palette

### Dark Theme Colors
```
Primary Background:   #0f172a (Dark slate-900)
Secondary BG:         #1e293b (Slate-800)
Border/Divider:       #334155 (Slate-700)
Hover/Focus:          #475569 (Slate-600)

Text Primary:         #ffffff (White)
Text Secondary:       #94a3b8 (Slate-400)
Text Tertiary:        #64748b (Slate-500)

Primary Action:       #3b82f6 (Blue-500)
Secondary Action:     #60a5fa (Blue-400)
Success:              #22c55e (Green-500)
Warning:              #f59e0b (Amber-500)
Error:                #ef4444 (Red-500)
Info:                 #06b6d4 (Cyan-500)
```

## Typography Scale

```
h1 (Header):    28px, weight: 700, letter-spacing: normal
h2 (Title):     20px, weight: 700, letter-spacing: normal
h3 (Section):   18px, weight: 600, letter-spacing: normal
h4 (Subtitle):  16px, weight: 600, letter-spacing: normal
body:           14px, weight: 500, letter-spacing: normal
small:          12px, weight: 400, letter-spacing: normal
caption:        11px, weight: 400, letter-spacing: normal
```

## Spacing System

```
xs: 4px
sm: 8px
md: 12px
lg: 16px      (standard)
xl: 20px
2xl: 24px
3xl: 32px
4xl: 40px
```

## Component Specs

### Cards
- Border radius: 12px
- Padding: 16px
- Background: #1e293b
- Border: 1px solid #334155
- Shadow: None (flat design)

### Buttons
- Border radius: 8-12px
- Padding: 12px 16px
- Height: 48px (standard tap target)
- Font size: 14px, weight: 600

### Input Fields
- Border radius: 8px
- Padding: 12px
- Height: 44px
- Border: 1px solid #334155
- Background: #0f172a

### Modals
- Border top radius: 24px
- Border bottom radius: 0px
- Background: #1e293b
- Shadow: 0 -4px 12px rgba(0,0,0,0.15)
- Overlay opacity: 0.7

## Animation Specs

### Standard Animations
- Fade: 300ms ease-in-out
- Slide: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- Scale: 200ms ease-out
- Pulse: 2000ms infinite

### Gestures
- Tap feedback: 100ms scale 0.98
- Long press: 500ms
- Swipe threshold: 50px

## Icon Guidelines

### Icon Sizes
- Small (action): 16px
- Medium (standard): 20-24px
- Large (header): 28-32px
- Extra large (hero): 48px+

### Icon Usage
- Primary actions: Color #3b82f6
- Secondary actions: Color #94a3b8
- Success state: Color #22c55e
- Error state: Color #ef4444
- Disabled: Color #64748b with opacity 0.5

## Responsive Breakpoints

```
Mobile:    < 375px
Standard:  375px - 480px
Tablet:    > 480px
```

## Accessibility

### Touch Targets
- Minimum: 44x44 points
- Preferred: 48x48 points

### Contrast
- Text: minimum 4.5:1 (WCAG AA)
- Large text: minimum 3:1 (WCAG AA)

### Text
- Line height: 1.5-1.6
- Max line length: 50-70 characters on mobile

## Component States

### Button States
- Default: Background color, text white
- Pressed: Darker background + scale 0.98
- Disabled: Opacity 0.5, no interaction
- Loading: Spinner overlay

### Card States
- Default: Border #334155
- Pressed: Border #3b82f6
- Selected: Background #1e293b, border #3b82f6
- Disabled: Opacity 0.5

### Form States
- Empty: Border #334155, text placeholder
- Filled: Border #334155, text white
- Focused: Border #3b82f6, shadow glow
- Error: Border #ef4444, icon red

## Safe Areas

```
Top padding:    insets.top + 12px
Bottom padding: insets.bottom + 12px
Side padding:   16px minimum
```

---

**Design System**: Comprehensive & Consistent
**Implementation**: Full adherence to specs
**Responsive**: Mobile-first approach
**Accessibility**: WCAG AA compliant
