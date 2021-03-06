import { Component } from 'react';
import classNames from 'classnames';
import styles from 'todomvc-app-css/index.css';
import { withDB } from 'react-pouchdb/browser';

export default withDB(
  class Item extends Component {
    state = { value: this.props.doc.title };
    componentWillReceiveProps({ doc: { title } }) {
      this.setValue(title);
    }
    setValue(value) {
      this.setState({ value });
    }
    setInputRef = input => {
      this.input = input;
    };
    save = () => {
      const { props: { db, doc }, state: { value } } = this;
      this.setState({ editing: false });
      db.put({
        ...doc,
        title: value
      });
    };
    remove = () => {
      const { db, doc } = this.props;
      db.remove(doc);
    };
    edit = () => {
      this.setState({ editing: true }, () => this.input.focus());
    };
    handleChange = ({ target: { value } }) => this.setValue(value);
    toggleComplete = () => {
      const { db, doc, doc: { completed } } = this.props;
      db.put({
        ...doc,
        completed: !completed
      });
    };
    render() {
      const {
        props: { doc: { completed = false } },
        state: { editing, value }
      } = this;
      return (
        <li
          className={classNames(
            completed && styles.completed,
            editing && styles.editing
          )}
          onDoubleClick={this.edit}
        >
          <div className={styles.view}>
            <input
              className={styles.toggle}
              checked={completed}
              onChange={this.toggleComplete}
              type="checkbox"
            />
            <label>{value}</label>
            <button className={styles.destroy} onClick={this.remove} />
          </div>
          <input
            className={styles.edit}
            ref={this.setInputRef}
            type="text"
            value={value}
            onChange={this.handleChange}
            onBlur={this.save}
          />
        </li>
      );
    }
  }
);
