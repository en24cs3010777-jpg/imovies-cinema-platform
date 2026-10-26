const bcrypt = require('bcryptjs');

// Unique ID generator
const newId = () =>
  '65' + Math.random().toString(16).substring(2, 10) + Date.now().toString(16).substring(0, 14);

// In-Memory Storage Tables
let tables = {
  users: [],
  movies: [],
  screens: [],
  showtimes: [],
  bookings: []
};

// Create document instance with .save() and methods
const createDoc = (tableKey, data) => {
  const doc = {
    _id: data._id || newId(),
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
    ...data
  };

  // User specific methods
  if (tableKey === 'users') {
    doc.matchPassword = async function (enteredPassword) {
      if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
      return enteredPassword === this.password;
    };
  }

  doc.save = async function () {
    this.updatedAt = new Date();
    const idx = tables[tableKey].findIndex((d) => d._id.toString() === this._id.toString());
    if (idx !== -1) {
      tables[tableKey][idx] = this;
    } else {
      tables[tableKey].push(this);
    }
    return this;
  };

  return doc;
};

// Query matcher helper
const matchesQuery = (doc, query = {}) => {
  for (const key of Object.keys(query)) {
    const val = query[key];

    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some((subQuery) => matchesQuery(doc, subQuery));
      if (!orMatched) return false;
      continue;
    }

    const docVal = doc[key];

    if (val && typeof val === 'object' && !(val instanceof Date)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(String(docVal || ''))) return false;
        continue;
      }
      if (val.$in && Array.isArray(val.$in)) {
        if (Array.isArray(docVal)) {
          const hasCommon = val.$in.some((item) => docVal.includes(item));
          if (!hasCommon) return false;
        } else if (!val.$in.includes(docVal)) {
          return false;
        }
        continue;
      }
      if (val.$nin && Array.isArray(val.$nin)) {
        if (val.$nin.includes(docVal)) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (String(docVal) === String(val.$ne)) return false;
        continue;
      }
      if (val.$gte !== undefined) {
        if (Number(docVal) < Number(val.$gte)) return false;
        continue;
      }
      if (val.$lte !== undefined) {
        if (Number(docVal) > Number(val.$lte)) return false;
        continue;
      }
    }

    if (key === '_id') {
      if (String(docVal) !== String(val)) return false;
      continue;
    }

    if (docVal !== val && String(docVal) !== String(val)) {
      return false;
    }
  }
  return true;
};

// Query execution helper supporting populate, sort, limit, skip, select
const createQueryHelper = (tableKey, initialList) => {
  let list = [...initialList];
  let populateFields = [];
  let sortField = null;
  let sortOrder = -1;
  let selectExcluded = [];
  let selectIncluded = [];
  let limitCount = null;
  let skipCount = 0;

  const helper = {
    populate: function (fields) {
      if (typeof fields === 'string') {
        populateFields.push(...fields.split(' '));
      } else if (typeof fields === 'object' && fields.path) {
        populateFields.push(fields.path);
      }
      return helper;
    },
    sort: function (arg) {
      if (typeof arg === 'string') {
        const desc = arg.startsWith('-');
        sortField = desc ? arg.substring(1) : arg;
        sortOrder = desc ? -1 : 1;
      } else if (typeof arg === 'object') {
        const firstKey = Object.keys(arg)[0];
        if (firstKey) {
          sortField = firstKey;
          sortOrder = arg[firstKey];
        }
      }
      return helper;
    },
    select: function (arg) {
      if (typeof arg === 'string') {
        const parts = arg.split(' ');
        parts.forEach((p) => {
          if (p.startsWith('-')) selectExcluded.push(p.substring(1));
          else if (p.startsWith('+')) selectIncluded.push(p.substring(1));
        });
      }
      return helper;
    },
    limit: function (n) {
      limitCount = n;
      return helper;
    },
    skip: function (n) {
      skipCount = n;
      return helper;
    },
    then: function (resolve, reject) {
      try {
        let result = list.map((doc) => {
          let cloned = { ...doc };
          // Methods binding
          if (tableKey === 'users') {
            cloned.matchPassword = doc.matchPassword;
          }
          cloned.save = doc.save;

          // Populate
          populateFields.forEach((field) => {
            if (field === 'movie' && cloned.movie) {
              const mId = cloned.movie._id || cloned.movie;
              const movieDoc = tables.movies.find((m) => m._id.toString() === mId.toString());
              if (movieDoc) cloned.movie = { ...movieDoc };
            }
            if (field === 'showtime' && cloned.showtime) {
              const sId = cloned.showtime._id || cloned.showtime;
              const sDoc = tables.showtimes.find((s) => s._id.toString() === sId.toString());
              if (sDoc) {
                cloned.showtime = { ...sDoc };
                // Also optionally populate showtime.movie
                if (cloned.showtime.movie) {
                  const subM = tables.movies.find((m) => m._id.toString() === (cloned.showtime.movie._id || cloned.showtime.movie).toString());
                  if (subM) cloned.showtime.movie = { ...subM };
                }
              }
            }
            if (field === 'screen' && cloned.screen) {
              const scId = cloned.screen._id || cloned.screen;
              const scDoc = tables.screens.find((sc) => sc._id.toString() === scId.toString());
              if (scDoc) cloned.screen = { ...scDoc };
            }
            if (field === 'user' && cloned.user) {
              const uId = cloned.user._id || cloned.user;
              const uDoc = tables.users.find((u) => u._id.toString() === uId.toString());
              if (uDoc) {
                const safeUser = { ...uDoc };
                delete safeUser.password;
                cloned.user = safeUser;
              }
            }
          });

          // Selection exclusions
          selectExcluded.forEach((k) => {
            delete cloned[k];
          });

          return cloned;
        });

        // Sorting
        if (sortField) {
          result.sort((a, b) => {
            let va = a[sortField];
            let vb = b[sortField];
            if (va instanceof Date) va = va.getTime();
            if (vb instanceof Date) vb = vb.getTime();
            if (va < vb) return sortOrder === -1 ? 1 : -1;
            if (va > vb) return sortOrder === -1 ? -1 : 1;
            return 0;
          });
        }

        // Pagination
        if (skipCount) result = result.slice(skipCount);
        if (limitCount !== null) result = result.slice(0, limitCount);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    }
  };

  return helper;
};

// Generic Model Factory
const createMemoryModel = (tableKey) => ({
  find: (query = {}) => {
    const matched = tables[tableKey].filter((doc) => matchesQuery(doc, query));
    return createQueryHelper(tableKey, matched);
  },

  findOne: (query = {}) => {
    const matched = tables[tableKey].filter((doc) => matchesQuery(doc, query));
    const helper = createQueryHelper(tableKey, matched.length > 0 ? [matched[0]] : []);
    const originalThen = helper.then;
    helper.then = (resolve, reject) => {
      originalThen((res) => resolve(res.length > 0 ? res[0] : null), reject);
    };
    return helper;
  },

  findById: (id) => {
    const matched = tables[tableKey].filter((doc) => doc._id.toString() === (id ? id.toString() : ''));
    const helper = createQueryHelper(tableKey, matched.length > 0 ? [matched[0]] : []);
    const originalThen = helper.then;
    helper.then = (resolve, reject) => {
      originalThen((res) => resolve(res.length > 0 ? res[0] : null), reject);
    };
    return helper;
  },

  create: async (data) => {
    let toInsert = Array.isArray(data) ? data : [data];
    const createdDocs = [];

    for (let item of toInsert) {
      const docData = { ...item };
      // Password hashing for User
      if (tableKey === 'users' && docData.password && !docData.password.startsWith('$2a$') && !docData.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        docData.password = await bcrypt.hash(docData.password, salt);
      }
      const doc = createDoc(tableKey, docData);
      tables[tableKey].push(doc);
      createdDocs.push(doc);
    }

    return Array.isArray(data) ? createdDocs : createdDocs[0];
  },

  countDocuments: async (query = {}) => {
    return tables[tableKey].filter((doc) => matchesQuery(doc, query)).length;
  },

  findByIdAndUpdate: async (id, update, options = {}) => {
    const idx = tables[tableKey].findIndex((doc) => doc._id.toString() === id.toString());
    if (idx === -1) return null;

    let updatedData = { ...tables[tableKey][idx], ...update, updatedAt: new Date() };
    if (update.$push) {
      // Handle push operations if needed
      for (const [key, val] of Object.entries(update.$push)) {
        if (!Array.isArray(updatedData[key])) updatedData[key] = [];
        updatedData[key].push(val);
      }
    }
    const doc = createDoc(tableKey, updatedData);
    tables[tableKey][idx] = doc;
    return doc;
  },

  findByIdAndDelete: async (id) => {
    const idx = tables[tableKey].findIndex((doc) => doc._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = tables[tableKey].splice(idx, 1);
    return removed[0];
  },

  deleteMany: async (query = {}) => {
    const countBefore = tables[tableKey].length;
    tables[tableKey] = tables[tableKey].filter((doc) => !matchesQuery(doc, query));
    return { deletedCount: countBefore - tables[tableKey].length };
  }
});

// Models
const memoryModels = {
  User: createMemoryModel('users'),
  Movie: createMemoryModel('movies'),
  Screen: createMemoryModel('screens'),
  Showtime: createMemoryModel('showtimes'),
  Booking: createMemoryModel('bookings'),
  _tables: tables,

  resetTables: () => {
    tables.users = [];
    tables.movies = [];
    tables.screens = [];
    tables.showtimes = [];
    tables.bookings = [];
  },

  initMemoryStore: async () => {
    if (tables.movies.length === 0) {
      const { seedDatabase } = require('./seedData');
      await seedDatabase();
    }
  }
};

module.exports = memoryModels;
