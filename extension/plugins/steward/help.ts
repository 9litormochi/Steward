/**
 * @file help command plugin script
 * @description help
 * @author rong
 */

import _ from 'underscore';

import util from 'common/util';
import { Command, Plugin } from 'plugins/type';
import { StewardApp } from 'common/type';
import { t } from 'helper/i18n.helper';
import { getURL } from 'helper/extension.helper';

export default function(Steward: StewardApp): Plugin {
  const { chrome } = Steward;

  const version = 3;
  const name = 'help';
  const key = 'help';
  const type = 'keyword';
  const icon = getURL('iconfont/help.svg');
  const title = t(`${name}_title`);
  const subtitle = t(`${name}_subtitle`);
  const commands: Command[] = [
    {
      key,
      type,
      title,
      subtitle,
      icon,
      shiftKey: true,
      editable: true,
    },
  ];

  // NOTE: Only get the commands when needed, main.js has been immediately obtained
  // and then get the object will be empty
  function getPlugins(query) {
    const allcommands = window.stewardCache.commands;
    const helpList = _.uniq(_.values(allcommands))
      .map(command => {
        return {
          icon: command.icon,
          id: command.key,
          name: command.name,
          title: `${command.key}: ${command.title}`,
          desc: `⇧: ${command.subtitle}`,
          type: command.type,
          category: command.plugin.category,
        };
      })
      .filter(item => item.type === 'keyword')
      .filter(function(command) {
        return util.matchText(query, `${command.name}${command.title}`);
      });

    return _.sortBy(helpList, 'id');
  }

  function onInput(query) {
    return getPlugins(query);
  }

  function onEnter(item, command, query, keyStatus) {
    const { shiftKey } = keyStatus;

    if (shiftKey) {
      util.createTab(
        { url: util.getDocumentURL(item.name, item.category) },
        keyStatus,
      );
    } else {
      return Promise.resolve(`${String(item.id.split(',')[0])} `);
    }
  }

  return {
    version,
    name: 'Help',
    category: 'steward',
    icon,
    title,
    commands,
    onInput,
    onEnter,
    canDisabled: false,
  };
}
