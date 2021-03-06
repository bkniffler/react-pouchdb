import { bool, oneOf, string } from 'prop-types';
import BaseComponent from './BaseComponent';
import renderProps, { propTypes } from './renderProps';
import attachmentsAsUint8Arrays from './attachmentsAsUint8Arrays';
import changesCache from './changesCache';

const UINT8ARRAY = 'u8a';
const ALLOWED_LIVE_OPTIONS = ['attachments', 'ajax', 'binary', 'id'];

export default class Get extends BaseComponent {
  static propTypes = {
    ...propTypes,
    attachments: oneOf([true, false, UINT8ARRAY]),
    binary: bool,
    id: string.isRequired
  };
  state = {};
  async listen(options) {
    const { context: { db } } = this;
    const { id, attachments, ...otherOptions } = options;
    const optionsWithAttachmentAndBinaryOption = {
      binary: attachments === UINT8ARRAY,
      ...otherOptions,
      attachments: !!attachments
    };
    if (
      this.setStateIfMounted(
        await this.get(id, optionsWithAttachmentAndBinaryOption)
      )
    ) {
      // Live?
      if (
        Object.keys(options).every(option =>
          ALLOWED_LIVE_OPTIONS.includes(option)
        )
      ) {
        this.cancel = db::changesCache(
          {
            ...optionsWithAttachmentAndBinaryOption,
            live: true,
            include_docs: true,
            since: 'now',
            doc_ids: [id]
          },
          async ({ doc }) => this.setStateIfMounted(await this.nextState(doc))
        );
      }
    }
  }
  async get(id, options) {
    const { context: { db } } = this;
    try {
      return await this.nextState(await db.get(id, options));
    } catch {
      return {
        exists: false
      };
    }
  }
  async nextState(doc) {
    return {
      attachments:
        this.props.attachments === UINT8ARRAY
          ? await attachmentsAsUint8Arrays(doc._attachments)
          : doc._attachments,
      doc,
      exists: !doc._deleted
    };
  }
  render() {
    const { context: { db }, props, state, state: { exists } } = this;
    return renderProps(props, exists, { db, ...state });
  }
}
