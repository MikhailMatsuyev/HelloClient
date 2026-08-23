Чеклист
src/router-menu/Item.tsx — ✅ сделано
Уже есть icon, collapsed, Link, active route.
src/router-menu/Group.tsx — ✅ сделано
Уже есть icon, определение active по дочерним routes.
src/router-menu/List.tsx — ✅ сделано
src/router-menu/Toggle.tsx — ❌ нет
src/router-menu/Root.tsx — ✅ сделано
Интеграция с useLocation() уже есть.
src/demo/Sidebar.tsx — 🟡 частично
Уже использует RouterMenu, но collapsed/openValue и кнопка collapse всё ещё находятся здесь.
src/demo/MobileNav.tsx — ❌ ещё не переделан
Всё ещё напрямую использует Menu, useLocation, useMenuSub.
Tests — ❌ финальные тесты RouterMenu ещё не сделаны.
