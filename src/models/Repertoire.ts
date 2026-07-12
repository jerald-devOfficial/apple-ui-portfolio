import { Document, model, models, Schema } from 'mongoose'

export interface IMoveNode {
  _id?: string
  san: string
  fen: string
  comment?: string
  nags?: number[]
  mainLine?: IMoveNode | null
  variations?: IMoveNode[]
}

export interface IRepertoireLine {
  _id: string
  title: string
  eco?: string
  rootFen?: string
  tree: IMoveNode
  pgn?: string
  order: number
}

export interface IRepertoireSection {
  _id: string
  title: string
  color: 'white' | 'black'
  parentMove?: string
  lines: IRepertoireLine[]
  order: number
}

export interface IRepertoire {
  _id: string
  userId: string
  sections: IRepertoireSection[]
  createdAt?: string
  updatedAt?: string
}

export interface IRepertoireDocument extends Omit<IRepertoire, '_id'>, Document {}

const moveNodeSchema = new Schema<IMoveNode>(
  {
    san: { type: String, default: '' },
    fen: { type: String, required: true },
    comment: String,
    nags: [Number],
    mainLine: { type: Schema.Types.Mixed, default: null },
    variations: { type: [Schema.Types.Mixed], default: [] }
  },
  { _id: true }
)

const repertoireLineSchema = new Schema<IRepertoireLine>(
  {
    title: { type: String, required: true, trim: true },
    eco: String,
    rootFen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    tree: { type: moveNodeSchema, required: true },
    pgn: String,
    order: { type: Number, default: 0 }
  },
  { _id: true }
)

const repertoireSectionSchema = new Schema<IRepertoireSection>(
  {
    title: { type: String, required: true, trim: true },
    color: { type: String, enum: ['white', 'black'], required: true },
    parentMove: String,
    lines: { type: [repertoireLineSchema], default: [] },
    order: { type: Number, default: 0 }
  },
  { _id: true }
)

const repertoireSchema = new Schema<IRepertoireDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    sections: { type: [repertoireSectionSchema], default: [] }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export const createRootNode = (fen?: string): IMoveNode => ({
  san: '',
  fen:
    fen ??
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  mainLine: null,
  variations: []
})

export const createDefaultSections = (): IRepertoireSection[] => {
  const rootFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  const whiteItalian: IMoveNode = {
    san: '',
    fen: rootFen,
    mainLine: {
      san: 'e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      mainLine: {
        san: 'e5',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        mainLine: {
          san: 'Nf3',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          mainLine: {
            san: 'Nc6',
            fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            mainLine: null,
            variations: []
          },
          variations: []
        },
        variations: []
      },
      variations: []
    },
    variations: []
  }

  const blackSicilian: IMoveNode = {
    san: '',
    fen: rootFen,
    mainLine: {
      san: 'e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      mainLine: {
        san: 'c5',
        fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
        mainLine: {
          san: 'Nf3',
          fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          mainLine: null,
          variations: []
        },
        variations: []
      },
      variations: []
    },
    variations: []
  }

  return [
    {
      title: '1. e4 Openings',
      color: 'white',
      parentMove: '1.e4',
      order: 0,
      lines: [
        {
          title: 'Italian Game',
          order: 0,
          tree: whiteItalian
        },
        {
          title: 'Ruy Lopez',
          order: 1,
          tree: createRootNode(rootFen)
        }
      ]
    },
    {
      title: 'vs 1. e4',
      color: 'black',
      order: 1,
      lines: [
        {
          title: 'Sicilian Defense',
          order: 0,
          tree: blackSicilian
        },
        {
          title: 'French Defense',
          order: 1,
          tree: createRootNode(rootFen)
        }
      ]
    }
  ] as IRepertoireSection[]
}

const Repertoire =
  models?.Repertoire || model<IRepertoireDocument>('Repertoire', repertoireSchema)

export default Repertoire
