import type { DefaultTheme } from 'vitepress';
import { useSidebar } from 'vitepress-openapi';

import spec from '../../packages/api-spec/dadata.json' with { type: 'json' };
import messages from '../locales';
import { getGroupedPaths } from './getGroupedPaths';
import { createMiniI18n } from './miniI18n';

type SidebarItem = DefaultTheme.SidebarItem;

export const getSpecSidebar = (lang: string): SidebarItem[] => {
  const t = createMiniI18n({ locale: lang, messages: messages });

  const sidebar = useSidebar({ spec: spec as any });
  const getItemHtml = (method: string, title: string) =>
    sidebar.sidebarItemTemplate({
      method: method as any,
      title,
      path: '',
    });

  const lvl0: SidebarItem[] = [];

  const groupedPaths = getGroupedPaths(lang);

  Object.entries(groupedPaths).forEach(([groupName, tags]) => {
    const lvl0obj: SidebarItem = {
      collapsed: groupName === 'byDirectoryType' ? true : false,
      text: t(`${groupName}.label`),
      items: [],
    };

    Object.entries(tags).forEach(([tag, operations]) => {
      const noLinksTags = ['address', 'party'];

      const lvl1obj: SidebarItem = {
        collapsed: true,
        text: t(`${groupName}.${tag}`),
        items: [],
        link:
          groupName === 'byDirectoryType' && !noLinksTags.includes(tag)
            ? `/${lang}/tags/${tag}`
            : undefined,
      };

      Object.entries(operations).forEach(([operationId, pathUi]) => {
        if (Object.keys(pathUi.verbs).length > 1) {
          const lvl2obj: SidebarItem = {
            collapsed: true,
            text: pathUi.label,
            items: [],
          };
          if (pathUi.pathTag) {
            lvl2obj.link = `/${lang}/tags/${pathUi.pathTag}`;
          }

          Object.entries(pathUi.verbs).forEach(([verb, verbData]) => {
            lvl2obj.items?.push({
              link: `/${lang}/api/${verbData.operationId}`,
              text: getItemHtml(verb, `${verbData.summary}`),
            });
          });
          lvl1obj.items?.push(lvl2obj);
        } else {
          lvl1obj.items?.push({
            link: `/${lang}/api/${operationId}`,
            text: getItemHtml(Object.keys(pathUi.verbs)[0], pathUi.label),
          });
        }
      });

      lvl0obj.items?.push(lvl1obj);
    });
    lvl0.push(lvl0obj);
  });

  return lvl0;
};
