import type { FieldMeta, CrudOperation, RuleMeta, ResourceMeta } from '@faster-crud/core';

// ── FieldBuilder ─────────────────────────────────────────────────────────────

export class FieldBuilder {
  private _label: string;
  private _rules: RuleMeta[] = [];
  private _deny: CrudOperation[] = [];
  private _hidden: ('list' | 'get')[] = [];
  private _searchable = false;
  private _readonly = false;
  private _ui: NonNullable<FieldMeta['ui']> = {};
  private _list: NonNullable<FieldMeta['list']> = {};

  constructor(label: string) {
    this._label = label;
  }

  required(message?: string): this {
    this._rules.push({ kind: 'required', message });
    return this;
  }

  length(min: number, max: number, message?: string): this {
    this._rules.push({ kind: 'length', params: { min, max }, message });
    return this;
  }

  email(message?: string): this {
    this._rules.push({ kind: 'email', message });
    this._ui.widget = 'email';
    return this;
  }

  deny(...ops: CrudOperation[]): this {
    this._deny.push(...ops);
    return this;
  }

  hidden(...views: ('list' | 'get')[]): this {
    this._hidden.push(...views);
    return this;
  }

  searchable(): this {
    this._searchable = true;
    return this;
  }

  sortable(): this {
    this._list.sortable = true;
    return this;
  }

  select(options: Array<{ label: string; value: unknown }>): this {
    this._ui.widget = 'select';
    // ColOptions.ui.options is Record<string,any> — cast array through unknown
    this._ui.options = options as unknown as Record<string, unknown>;
    return this;
  }

  password(): this {
    this._ui.widget = 'password';
    return this;
  }

  readonly(): this {
    this._readonly = true;
    return this;
  }

  width(px: number): this {
    this._list.width = px;
    return this;
  }

  placeholder(text: string): this {
    this._ui.placeholder = text;
    return this;
  }

  /** @internal — called by defineSchema */
  _build(key: string): FieldMeta {
    return {
      key,
      type: 'String',
      label: this._label,
      ...(this._rules.length > 0 && { rules: this._rules }),
      ...(this._deny.length > 0  && { deny: this._deny }),
      ...(this._hidden.length > 0 && { hidden: this._hidden }),
      ...(this._searchable        && { searchable: true }),
      ...(this._readonly          && { readonly: true }),
      ...(Object.keys(this._ui).length   > 0 && { ui: { ...this._ui } }),
      ...(Object.keys(this._list).length > 0 && { list: { ...this._list } }),
    };
  }
}

/** Create a field definition with a fluent builder. */
export function field(label: string): FieldBuilder {
  return new FieldBuilder(label);
}

// ── defineSchema ─────────────────────────────────────────────────────────────

export interface DefineSchemaOptions {
  /** Defaults to all five CRUD operations. */
  operations?: ResourceMeta['operations'];
  pagination?: ResourceMeta['pagination'];
}

/**
 * Convert a map of `field()` builders into a `ResourceMeta` object.
 *
 * @example
 * const userMeta = defineSchema('users', {
 *   username: field('Username').required().length(3, 20).searchable().sortable(),
 *   role:     field('Role').deny('create').select([...]),
 * });
 */
export function defineSchema(
  name: string,
  schema: Record<string, FieldBuilder>,
  opts?: DefineSchemaOptions,
): ResourceMeta {
  const fields: ResourceMeta['fields'] = {};
  for (const [key, builder] of Object.entries(schema)) {
    fields[key] = builder._build(key);
  }
  return {
    name,
    operations: opts?.operations ?? ['create', 'list', 'get', 'update', 'remove'],
    ...(opts?.pagination && { pagination: opts.pagination }),
    fields,
  };
}
