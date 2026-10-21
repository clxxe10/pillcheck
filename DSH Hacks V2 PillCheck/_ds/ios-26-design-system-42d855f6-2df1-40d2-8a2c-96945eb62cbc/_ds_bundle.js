/* @ds-bundle: {"format":4,"namespace":"IOS26DesignSystem_42d855","components":[],"sourceHashes":{"ui_kits/ios/HomeScreen.jsx":"8da91201b670","ui_kits/ios/LockScreen.jsx":"037a6a3cbb92","ui_kits/ios/MessagesScreen.jsx":"3548c7dabd43","ui_kits/ios/MusicScreen.jsx":"e3d1101e998d","ui_kits/ios/SettingsScreen.jsx":"60a42b7bfad2","ui_kits/ios/ios-frame.jsx":"d67eb3ffe562","ui_kits/ipados/IPadSettings.jsx":"4a544b4da77c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.IOS26DesignSystem_42d855 = window.IOS26DesignSystem_42d855 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/ios/HomeScreen.jsx
try { (() => {
// HomeScreen.jsx — iOS 26 Home Screen with dock (Liquid Glass)

const HOME_APPS = [['facetime', 'FaceTime'], ['calendar', 'Calendar'], ['photos', 'Photos'], ['camera', 'Camera'], ['maps', 'Maps'], ['clock', 'Clock'], ['weather', 'Weather'], ['reminders', 'Reminders'], ['notes', 'Notes'], ['stocks', 'Stocks'], ['books', 'Books'], ['news', 'News'], ['tv', 'TV'], ['podcasts', 'Podcasts'], ['health', 'Health'], ['wallet', 'Wallet'], ['settings', 'Settings'], ['translate', 'Translate'], ['home', 'Home'], ['files', 'Files'], ['findmy', 'Find My'], ['shortcuts', 'Shortcuts'], ['fitness', 'Fitness'], ['contacts', 'Contacts']];
const DOCK_APPS = [['phone', 'Phone'], ['safari', 'Safari'], ['messages', 'Messages'], ['music', 'Music']];
function IOSHomeScreen({
  onOpenApp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'url(../../assets/wallpaper.png) center/cover no-repeat',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, system-ui',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 59
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 18px',
      borderRadius: 9999,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0.04,
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      background: 'rgba(0,0,0,0.25)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.3)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, null), "Search")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: '22px 0',
      padding: '8px 18px 0',
      alignContent: 'start'
    }
  }, HOME_APPS.map(([id, name]) => /*#__PURE__*/React.createElement(AppTile, {
    key: id,
    id: id,
    name: name,
    onClick: onOpenApp
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Dot, {
    active: true
  }), /*#__PURE__*/React.createElement(Dot, null), /*#__PURE__*/React.createElement(Dot, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px 38px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12,
      padding: '12px 14px',
      borderRadius: 34,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.20)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 -0.5px 0 rgba(0,0,0,0.1)'
    }
  }, DOCK_APPS.map(([id, name]) => /*#__PURE__*/React.createElement(AppTile, {
    key: id,
    id: id,
    name: name,
    onClick: onOpenApp,
    hideLabel: true
  })))));
}
function AppTile({
  id,
  name,
  onClick,
  hideLabel
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onClick && onClick(id),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `../../assets/app-icons/${id}.png`,
    style: {
      width: 60,
      height: 60,
      borderRadius: '22.37%',
      boxShadow: '0 4px 8px rgba(0,0,0,0.18)'
    },
    alt: name
  }), !hideLabel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 400,
      color: '#fff',
      letterSpacing: 0.1,
      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
    }
  }, name));
}
function Dot({
  active
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 9999,
      background: active ? '#fff' : 'rgba(255,255,255,0.45)'
    }
  });
}
function SearchIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4.3-4.3"
  }));
}
window.IOSHomeScreen = IOSHomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/LockScreen.jsx
try { (() => {
// LockScreen.jsx — iOS 26 lock screen with wallpaper, time, notification stack

function IOSLockScreen({
  onUnlock
}) {
  const wallpaper = "../../assets/wallpaper.png";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onUnlock,
    style: {
      position: 'absolute',
      inset: 0,
      cursor: 'pointer',
      background: `url(${wallpaper}) center/cover no-repeat`,
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: '-apple-system, system-ui',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 59
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: 0.5,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
    }
  }, "Tuesday, 26 May"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 96,
      fontWeight: 300,
      letterSpacing: -3,
      marginTop: -4,
      textShadow: '0 2px 8px rgba(0,0,0,0.18)',
      lineHeight: 1.05
    }
  }, "9:41")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 12px 24px'
    }
  }, /*#__PURE__*/React.createElement(LockNotification, {
    appIcon: "../../assets/app-icons/messages.png",
    appName: "MESSAGES",
    title: "Alex Chen",
    body: "See you tonight! Bringing the wine \uD83C\uDF77",
    time: "now"
  }), /*#__PURE__*/React.createElement(LockNotification, {
    appIcon: "../../assets/app-icons/calendar.png",
    appName: "CALENDAR",
    title: "Design Review",
    body: "In 30 minutes \xB7 Conference Room 3",
    time: "9:11"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 32px 38px'
    }
  }, /*#__PURE__*/React.createElement(GlassControl, null, /*#__PURE__*/React.createElement(FlashlightIcon, null)), /*#__PURE__*/React.createElement(GlassControl, null, /*#__PURE__*/React.createElement(CameraIcon, null))));
}
function LockNotification({
  appIcon,
  appName,
  title,
  body,
  time
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 22,
      padding: '12px 14px',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.18)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 -0.5px 0 rgba(0,0,0,0.1)',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: appIcon,
    style: {
      width: 38,
      height: 38,
      borderRadius: '22.37%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      fontWeight: 600,
      letterSpacing: 0.04
    }
  }, appName), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.55)',
      marginLeft: 'auto',
      fontWeight: 400
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      marginTop: 1,
      letterSpacing: -0.2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 400,
      letterSpacing: -0.2,
      color: 'rgba(255,255,255,0.92)'
    }
  }, body)));
}
function GlassControl({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      background: 'rgba(0,0,0,0.32)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.3)'
    }
  }, children);
}
function FlashlightIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 2H8v3l1 3v11a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8l1-3V2zM12 11v4"
  }));
}
function CameraIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  }));
}
window.IOSLockScreen = IOSLockScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/LockScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/MessagesScreen.jsx
try { (() => {
// MessagesScreen.jsx — iOS Messages conversation

function IOSMessagesScreen({
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: '#fff',
      fontFamily: '-apple-system, system-ui',
      color: '#000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 59
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.65)',
      borderBottom: '0.5px solid rgba(60,60,67,0.18)',
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onBack,
    style: {
      color: '#007AFF',
      fontSize: 17,
      fontWeight: 400,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      cursor: 'pointer',
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: "#007AFF",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("span", null, "13")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9999,
      background: 'linear-gradient(135deg,#5856D6,#AF52DE)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
      fontWeight: 600
    }
  }, "AC"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      marginTop: 2
    }
  }, "Alex Chen \u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Bubble, {
    side: "them"
  }, "Hey! Are we still on for dinner tonight?"), /*#__PURE__*/React.createElement(Bubble, {
    side: "them"
  }, "7pm at Lula's right?"), /*#__PURE__*/React.createElement(DayLabel, null, "Today 9:11 AM"), /*#__PURE__*/React.createElement(Bubble, {
    side: "me"
  }, "Yes! Just confirmed the reservation"), /*#__PURE__*/React.createElement(Bubble, {
    side: "me"
  }, "Bringing the wine \uD83C\uDF77"), /*#__PURE__*/React.createElement(Bubble, {
    side: "them"
  }, "Perfect \uD83D\uDE0A see you then"), /*#__PURE__*/React.createElement(ReadReceipt, null, "Delivered")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px 12px',
      display: 'flex',
      gap: 8,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(CircleBtn, null, /*#__PURE__*/React.createElement(PlusIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 36,
      padding: '7px 12px 7px 14px',
      border: '1px solid rgba(60,60,67,0.18)',
      borderRadius: 18,
      fontSize: 17,
      color: 'rgba(60,60,67,0.45)',
      letterSpacing: -0.4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "iMessage"), /*#__PURE__*/React.createElement(CircleBtn, {
    small: true
  }, /*#__PURE__*/React.createElement(MicIcon, null)))));
}
function Bubble({
  side,
  children
}) {
  const me = side === 'me';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: me ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '72%',
      padding: '8px 13px',
      borderRadius: 20,
      fontSize: 17,
      letterSpacing: -0.4,
      lineHeight: '22px',
      background: me ? '#007AFF' : 'rgba(120,120,128,0.16)',
      color: me ? '#fff' : '#000'
    }
  }, children));
}
function DayLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: 'rgba(60,60,67,0.6)',
      fontWeight: 600,
      letterSpacing: 0.06,
      margin: '8px 0 4px'
    }
  }, children);
}
function ReadReceipt({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontSize: 11,
      color: 'rgba(60,60,67,0.6)',
      marginTop: 2
    }
  }, children);
}
function CircleBtn({
  children,
  small
}) {
  const s = small ? 26 : 30;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: s,
      height: s,
      borderRadius: 9999,
      background: 'rgba(120,120,128,0.16)',
      color: '#3C3C43',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, children);
}
function PlusIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }));
}
function MicIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
  }));
}
window.IOSMessagesScreen = IOSMessagesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/MessagesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/MusicScreen.jsx
try { (() => {
// MusicScreen.jsx — iOS Music "Now Playing" with Liquid Glass controls

function IOSMusicScreen({
  onBack
}) {
  const [playing, setPlaying] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: 'linear-gradient(180deg,#7A3F8F 0%, #C44C66 60%, #FF8A4C 100%)',
      fontFamily: '-apple-system, system-ui',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 59
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onBack,
    style: {
      padding: '8px 12px',
      borderRadius: 9999,
      fontSize: 13,
      fontWeight: 600,
      background: 'rgba(255,255,255,0.22)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: '#fff',
      cursor: 'pointer'
    }
  }, "\u2039 Home"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "2"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      height: 280,
      borderRadius: 18,
      overflow: 'hidden',
      background: 'linear-gradient(135deg,#FFB36A,#FF5A5F 50%,#7A3F8F)',
      position: 'relative',
      boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      transform: playing ? 'scale(1)' : 'scale(0.86)',
      transition: 'transform .42s cubic-bezier(0.32,0.72,0,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 50%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 24,
      bottom: 24,
      fontSize: 54,
      fontWeight: 900,
      letterSpacing: -2
    }
  }, "FA"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 32px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: -0.4
    }
  }, "Fade Away"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 400,
      color: 'rgba(255,255,255,0.78)',
      letterSpacing: -0.3
    }
  }, "Sun Frost \xB7 Halflight")), /*#__PURE__*/React.createElement(CircleStar, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 32px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 6,
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.25)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '42%',
      background: 'rgba(255,255,255,0.85)',
      borderRadius: 9999
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 6,
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("span", null, "1:43"), /*#__PURE__*/React.createElement("span", null, "\u22122:21"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 36,
      padding: '24px 32px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: iconBtn
  }, /*#__PURE__*/React.createElement("svg", {
    width: "34",
    height: "34",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 4l-9.5 7 9.5 7V4z"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "4",
    width: "2",
    height: "14"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPlaying(!playing),
    style: {
      ...iconBtn,
      width: 80,
      height: 80
    }
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "4",
    width: "4",
    height: "16"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "4",
    width: "4",
    height: "16"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    style: {
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 3l16 9-16 9z"
  }))), /*#__PURE__*/React.createElement("button", {
    style: iconBtn
  }, /*#__PURE__*/React.createElement("svg", {
    width: "34",
    height: "34",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 4l9.5 7L5 18V4z"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "4",
    width: "2",
    height: "14"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 24px 38px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '14px',
      borderRadius: 9999,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.22)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: smIcon
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 9v6h4l5 4V5L7 9H3z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      height: 4,
      margin: '0 14px',
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '55%',
      background: '#fff',
      borderRadius: 9999
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: smIcon
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 9v6h4l5 4V5L7 9H3zM16 8a4 4 0 0 1 0 8M19 5a8 8 0 0 1 0 14"
  }))))));
}
const iconBtn = {
  all: 'unset',
  cursor: 'pointer',
  width: 60,
  height: 60,
  borderRadius: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff'
};
const smIcon = {
  color: '#fff',
  display: 'flex',
  alignItems: 'center'
};
function CircleStar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2L9.2 8.2 2 9.2l5.3 5.2L6 22l6-3.3L18 22l-1.3-7.6L22 9.2l-7.2-1z"
  })));
}
window.IOSMusicScreen = IOSMusicScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/MusicScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/SettingsScreen.jsx
try { (() => {
// SettingsScreen.jsx — iOS 26 Settings screen with grouped lists

function IOSSettingsScreen({
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: '#F2F2F7',
      overflow: 'hidden',
      fontFamily: '-apple-system, system-ui',
      color: '#000'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 59
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '59px 0 0 0',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 20px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 700,
      letterSpacing: -0.4
    }
  }, "Settings")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      height: 36,
      padding: '0 10px',
      background: 'rgba(118,118,128,0.12)',
      borderRadius: 10,
      fontSize: 17,
      color: 'rgba(60,60,67,0.6)',
      letterSpacing: -0.4
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, null), "Search")), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(ProfileRow, null)), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#FF9500"
    }, /*#__PURE__*/React.createElement(AirplaneIcon, null)),
    title: "Airplane Mode",
    right: /*#__PURE__*/React.createElement(Toggle, null)
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#34C759"
    }, /*#__PURE__*/React.createElement(WifiIcon, null)),
    title: "Wi-Fi",
    detail: "Studio"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#007AFF"
    }, /*#__PURE__*/React.createElement(BluetoothIcon, null)),
    title: "Bluetooth",
    detail: "On"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#34C759"
    }, /*#__PURE__*/React.createElement(CellularIcon, null)),
    title: "Cellular",
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#FF3B30"
    }, /*#__PURE__*/React.createElement(NotificationIcon, null)),
    title: "Notifications"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#FF3B30"
    }, /*#__PURE__*/React.createElement(SoundsIcon, null)),
    title: "Sounds & Haptics"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#5856D6"
    }, /*#__PURE__*/React.createElement(FocusIcon, null)),
    title: "Focus"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#FF9500"
    }, /*#__PURE__*/React.createElement(ScreenTimeIcon, null)),
    title: "Screen Time",
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#8E8E93"
    }, /*#__PURE__*/React.createElement(GearIcon, null)),
    title: "General"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#007AFF"
    }, /*#__PURE__*/React.createElement(AccessibilityIcon, null)),
    title: "Accessibility"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: /*#__PURE__*/React.createElement(TileIcon, {
      bg: "#8E8E93"
    }, /*#__PURE__*/React.createElement(PrivacyIcon, null)),
    title: "Privacy & Security",
    last: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 120
    }
  })), /*#__PURE__*/React.createElement("div", {
    onClick: onBack,
    style: {
      position: 'absolute',
      top: 14,
      left: 14,
      padding: '7px 14px',
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      fontSize: 13,
      fontWeight: 600,
      color: '#007AFF',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }
  }, "\u2039 Home"));
}
function Group({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 10,
      margin: '0 16px 22px',
      boxShadow: '0 0 0 0.5px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }
  }, children);
}
function Row({
  icon,
  title,
  detail,
  right,
  last
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 16px',
      height: 44,
      position: 'relative'
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 17,
      letterSpacing: -0.4
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(60,60,67,0.6)',
      fontSize: 17
    }
  }, detail), right ? right : /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: "rgba(60,60,67,0.3)",
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !last && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 60,
      right: 0,
      bottom: 0,
      height: 0.5,
      background: 'rgba(60,60,67,0.29)'
    }
  }));
}
function ProfileRow() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 9999,
      background: 'linear-gradient(135deg, #FF9500, #FF2D55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 600,
      fontSize: 24,
      letterSpacing: -0.5
    }
  }, "AC"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: -0.5
    }
  }, "Alex Chen"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(60,60,67,0.6)',
      marginTop: 2
    }
  }, "Apple Account, iCloud, and more")), /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: "rgba(60,60,67,0.3)",
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
function Toggle({
  on = true
}) {
  const [v, setV] = React.useState(on);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.stopPropagation();
      setV(!v);
    },
    style: {
      width: 51,
      height: 31,
      borderRadius: 9999,
      position: 'relative',
      background: v ? '#34C759' : 'rgba(120,120,128,0.16)',
      transition: 'background .26s cubic-bezier(0.32,0.72,0,1)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 2,
      left: 2,
      width: 27,
      height: 27,
      borderRadius: 9999,
      background: '#fff',
      boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)',
      transform: v ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform .26s cubic-bezier(0.32,0.72,0,1)'
    }
  }));
}
function TileIcon({
  bg,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      flexShrink: 0
    }
  }, children);
}

// minimal sf-symbol-like icons
const I = (path, sw = 2) => /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, path);
function AirplaneIcon() {
  return I(/*#__PURE__*/React.createElement("path", {
    d: "M17 16v4l-5-2-5 2v-4l-5-3v-2l5 1V7l-3-2V3l5 1 1-2 1 2 5-1v2l-3 2v5l5-1v2z"
  }));
}
function WifiIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.55a11 11 0 0 1 14 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 8.82a15 15 0 0 1 20 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 16.5a5 5 0 0 1 7 0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "20",
    r: "1.2",
    fill: "currentColor"
  })));
}
function BluetoothIcon() {
  return I(/*#__PURE__*/React.createElement("path", {
    d: "M7 7l10 10-5 5V2l5 5L7 17"
  }));
}
function CellularIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "16",
    width: "3",
    height: "5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "12",
    width: "3",
    height: "9"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "8",
    width: "3",
    height: "13"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "3",
    width: "2",
    height: "18",
    opacity: ".35"
  })));
}
function NotificationIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.7 21a2 2 0 0 1-3.4 0"
  })));
}
function SoundsIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M11 5L6 9H2v6h4l5 4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
  })));
}
function FocusIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 1.9 14.5 9l7.5 .9-5.5 5L18 22l-6-3.5L6 22l1.5-7.1L2 9.9 9.5 9z"
  })));
}
function ScreenTimeIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 3"
  })));
}
function GearIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 12a7 7 0 0 0-.13-1.34l2.05-1.6-2-3.46-2.42.79a7 7 0 0 0-2.31-1.34L13.79 2h-4l-.4 2.45a7 7 0 0 0-2.31 1.34L4.66 5l-2 3.46 2.05 1.6A7 7 0 0 0 4.58 12c0 .45.05.9.13 1.34l-2.05 1.6 2 3.46 2.42-.79a7 7 0 0 0 2.31 1.34l.4 2.45h4l.4-2.45a7 7 0 0 0 2.31-1.34l2.42.79 2-3.46-2.05-1.6c.08-.44.13-.89.13-1.34z"
  })));
}
function AccessibilityIcon() {
  return I(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "4",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v10M6 9l6 1 6-1M8 22l4-10 4 10"
  })));
}
function PrivacyIcon() {
  return I(/*#__PURE__*/React.createElement("path", {
    d: "M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
  }));
}
function SearchIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4.3-4.3",
    strokeLinecap: "round"
  }));
}
window.IOSSettingsScreen = IOSSettingsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ipados/IPadSettings.jsx
try { (() => {
// iPadSettings.jsx — iPad Settings screen with split-view sidebar

function IPadSettings() {
  const [sel, setSel] = React.useState('general');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: '#F2F2F7',
      display: 'flex',
      fontFamily: '-apple-system, system-ui',
      color: '#000',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    selected: sel,
    onSelect: setSel
  }), /*#__PURE__*/React.createElement(Detail, {
    selected: sel
  }));
}
const SIDEBAR_ITEMS = [['account', 'Alex Chen', 'avatar'], null, ['airplane', 'Airplane Mode', '#FF9500', 'airplane'], ['wifi', 'Wi-Fi', '#34C759', 'wifi'], ['bluetooth', 'Bluetooth', '#007AFF', 'bluetooth'], null, ['notifications', 'Notifications', '#FF3B30', 'bell'], ['sounds', 'Sounds', '#FF3B30', 'speaker'], ['focus', 'Focus', '#5856D6', 'moon'], ['screen', 'Screen Time', '#FF9500', 'hourglass'], null, ['general', 'General', '#8E8E93', 'gear'], ['accessibility', 'Accessibility', '#007AFF', 'a11y'], ['privacy', 'Privacy & Security', '#8E8E93', 'shield']];
function Sidebar({
  selected,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(242,242,247,0.85)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderRight: '0.5px solid rgba(60,60,67,0.18)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 24px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 700,
      letterSpacing: -0.4
    }
  }, "Settings")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      height: 36,
      padding: '0 10px',
      background: 'rgba(118,118,128,0.12)',
      borderRadius: 10,
      fontSize: 17,
      color: 'rgba(60,60,67,0.6)',
      letterSpacing: -0.4
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, null), "Search")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 8px 16px'
    }
  }, SIDEBAR_ITEMS.map((it, i) => it === null ? /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 14
    }
  }) : it[0] === 'account' ? /*#__PURE__*/React.createElement(AccountRow, {
    key: i,
    selected: selected === 'account',
    onClick: () => onSelect('account')
  }) : /*#__PURE__*/React.createElement(SidebarRow, {
    key: i,
    id: it[0],
    title: it[1],
    color: it[2],
    icon: it[3],
    selected: selected === it[0],
    onClick: () => onSelect(it[0])
  }))));
}
function AccountRow({
  selected,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      padding: '10px 12px',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      borderRadius: 10,
      cursor: 'pointer',
      background: selected ? 'rgba(0,122,255,0.15)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 9999,
      background: 'linear-gradient(135deg,#FF9500,#FF2D55)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 17,
      letterSpacing: -0.4
    }
  }, "AC"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: -0.4
    }
  }, "Alex Chen"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(60,60,67,0.6)'
    }
  }, "Apple Account, iCloud, and more")));
}
function SidebarRow({
  title,
  color,
  icon,
  selected,
  onClick
}) {
  const isAccent = selected;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      padding: '6px 12px',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      borderRadius: 10,
      cursor: 'pointer',
      minHeight: 36,
      background: isAccent ? '#007AFF' : 'transparent',
      color: isAccent ? '#fff' : '#000',
      transition: 'background .14s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: isAccent ? 'rgba(255,255,255,0.22)' : color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(SidebarIcon, {
    name: icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      letterSpacing: -0.4
    }
  }, title));
}
function Detail({
  selected
}) {
  if (selected === 'general') return /*#__PURE__*/React.createElement(GeneralDetail, null);
  if (selected === 'wifi') return /*#__PURE__*/React.createElement(WifiDetail, null);
  if (selected === 'account') return /*#__PURE__*/React.createElement(AccountDetail, null);
  return /*#__PURE__*/React.createElement(PlaceholderDetail, {
    title: titleFor(selected)
  });
}
function titleFor(id) {
  const it = SIDEBAR_ITEMS.find(i => Array.isArray(i) && i[0] === id);
  return it ? it[1] : 'Settings';
}
function GeneralDetail() {
  return /*#__PURE__*/React.createElement(DetailFrame, {
    title: "General"
  }, /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "About",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Software Update",
    detail: "iOS 26.1",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "AppleCare & Warranty",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "AirDrop",
    detail: "Contacts Only",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "AirPlay & Continuity",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Picture in Picture",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "CarPlay",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "iPad Storage",
    detail: "178.3 GB",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Background App Refresh",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Date & Time",
    detail: "Automatic",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Keyboard",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Fonts",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Language & Region",
    detail: "English (US)",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Dictionary",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "VPN & Device Management",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Legal & Regulatory",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Transfer or Reset iPad",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Shut Down",
    destructive: true,
    last: true
  })));
}
function WifiDetail() {
  return /*#__PURE__*/React.createElement(DetailFrame, {
    title: "Wi-Fi"
  }, /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Wi-Fi",
    right: /*#__PURE__*/React.createElement(Toggle, {
      on: true
    }),
    last: true
  })), /*#__PURE__*/React.createElement(SectionHeader, null, "My Networks"), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Studio",
    detail: "Connected",
    indicator: "check",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Studio Guest",
    indicator: "lock",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(SectionHeader, null, "Other Networks"), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Cafe Mistral",
    indicator: "lock",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Pluto-5G",
    indicator: "lock",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Other\u2026",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Foot, null, "Known networks will be joined automatically. If no known networks are available, you will have to manually select a network."));
}
function AccountDetail() {
  return /*#__PURE__*/React.createElement(DetailFrame, {
    title: "Apple Account"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 96,
      borderRadius: 9999,
      background: 'linear-gradient(135deg,#FF9500,#FF2D55)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 40,
      letterSpacing: -1,
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
    }
  }, "AC"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      marginTop: 12
    }
  }, "Alex Chen"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: 'rgba(60,60,67,0.6)'
    }
  }, "alex@me.com")), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Personal Information",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Sign-In & Security",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Payment & Shipping",
    detail: "Apple Pay",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "iCloud",
    detail: "158 GB",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Subscriptions",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Family Sharing",
    detail: "4 people",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Find My",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Media & Purchases",
    chevron: true,
    last: true
  })), /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "Sign Out",
    destructive: true,
    last: true
  })));
}
function PlaceholderDetail({
  title
}) {
  return /*#__PURE__*/React.createElement(DetailFrame, {
    title: title
  }, /*#__PURE__*/React.createElement(Group, null, /*#__PURE__*/React.createElement(Row, {
    title: "This section is part of the iOS 26 UI kit.",
    last: true,
    detail: ""
  })), /*#__PURE__*/React.createElement(Foot, null, "The sidebar pattern is the focus of this iPad screen. Tap other sidebar items to switch \u2014 the system color and selection state animate in."));
}
function DetailFrame({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(242,242,247,0.6)',
      borderBottom: '0.5px solid rgba(60,60,67,0.18)',
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement(ToolbarPill, null, /*#__PURE__*/React.createElement(Sidebar2Icon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: -0.4
    }
  }, title), /*#__PURE__*/React.createElement(ToolbarPill, null, /*#__PURE__*/React.createElement(EllipsisIcon, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 0 80px'
    }
  }, children));
}
function ToolbarPill({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000',
      cursor: 'pointer'
    }
  }, children);
}
function Group({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 10,
      margin: '0 24px 22px',
      boxShadow: '0 0 0 0.5px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }
  }, children);
}
function SectionHeader({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 36px 6px',
      fontSize: 13,
      color: 'rgba(60,60,67,0.6)',
      textTransform: 'uppercase',
      letterSpacing: 0.04,
      fontWeight: 400
    }
  }, children);
}
function Foot({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 36px',
      fontSize: 13,
      color: 'rgba(60,60,67,0.6)',
      lineHeight: '18px',
      maxWidth: 640
    }
  }, children);
}
function Row({
  title,
  detail,
  right,
  chevron,
  destructive,
  indicator,
  last
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 16px',
      height: 44,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 17,
      letterSpacing: -0.4,
      color: destructive ? '#FF3B30' : '#000'
    }
  }, title), indicator === 'check' && /*#__PURE__*/React.createElement(CheckIcon, {
    color: "#007AFF"
  }), indicator === 'lock' && /*#__PURE__*/React.createElement(LockIcon, {
    color: "rgba(60,60,67,0.3)"
  }), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      color: 'rgba(60,60,67,0.6)',
      letterSpacing: -0.4
    }
  }, detail), right ? right : chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: "rgba(60,60,67,0.3)",
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !last && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 0,
      bottom: 0,
      height: 0.5,
      background: 'rgba(60,60,67,0.29)'
    }
  }));
}
function Toggle({
  on
}) {
  const [v, setV] = React.useState(!!on);
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => setV(!v),
    style: {
      width: 51,
      height: 31,
      borderRadius: 9999,
      position: 'relative',
      background: v ? '#34C759' : 'rgba(120,120,128,0.16)',
      transition: 'background .26s cubic-bezier(0.32,0.72,0,1)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 2,
      left: 2,
      width: 27,
      height: 27,
      borderRadius: 9999,
      background: '#fff',
      boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)',
      transform: v ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform .26s cubic-bezier(0.32,0.72,0,1)'
    }
  }));
}

// icons
const Sv = ({
  children,
  w = 16,
  h = 16
}) => /*#__PURE__*/React.createElement("svg", {
  width: w,
  height: h,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, children);
function SidebarIcon({
  name
}) {
  const c = 'currentColor';
  if (name === 'airplane') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M17 16v4l-5-2-5 2v-4l-5-3v-2l5 1V7l-3-2V3l5 1 1-2 1 2 5-1v2l-3 2v5l5-1v2z"
  }));
  if (name === 'wifi') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.55a11 11 0 0 1 14 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 8.82a15 15 0 0 1 20 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 16.5a5 5 0 0 1 7 0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "20",
    r: "1.2",
    fill: c
  }));
  if (name === 'bluetooth') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M7 7l10 10-5 5V2l5 5L7 17"
  }));
  if (name === 'bell') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.7 21a2 2 0 0 1-3.4 0"
  }));
  if (name === 'speaker') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M11 5L6 9H2v6h4l5 4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 4a10 10 0 0 1 0 16M15.5 8a5 5 0 0 1 0 7"
  }));
  if (name === 'moon') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
  }));
  if (name === 'hourglass') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 2h12M6 22h12M6 2v4l6 6-6 6v4M18 2v4l-6 6 6 6v4"
  }));
  if (name === 'gear') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.7 1.7 0 0 0 .4 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.4 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.4-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.4h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 0 1 4 0v.1c0 .7.5 1.3 1.1 1.5a1.7 1.7 0 0 0 1.8-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.8v.1c.2.6.8 1 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
  }));
  if (name === 'a11y') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "4",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v10M6 9l6 1 6-1M8 22l4-10 4 10"
  }));
  if (name === 'shield') return /*#__PURE__*/React.createElement(Sv, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
  }));
  return null;
}
function SearchIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4.3-4.3",
    strokeLinecap: "round"
  }));
}
function Sidebar2Icon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "16",
    rx: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "4",
    x2: "9",
    y2: "20"
  }));
}
function EllipsisIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "2"
  }));
}
function CheckIcon({
  color
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12l5 5L20 7"
  }));
}
function LockIcon({
  color
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "11",
    width: "16",
    height: "11",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V7a4 4 0 0 1 8 0v4"
  }));
}
window.IPadSettings = IPadSettings;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipados/IPadSettings.jsx", error: String((e && e.message) || e) }); }

})();
